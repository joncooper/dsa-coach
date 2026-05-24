import Cocoa
import WebKit

@main
enum DsaCoachNextApplication {
    private static var appDelegate: AppDelegate?

    static func main() {
        let app = NSApplication.shared
        let delegate = AppDelegate()
        appDelegate = delegate
        app.delegate = delegate
        app.run()
    }
}

final class AppDelegate: NSObject, NSApplicationDelegate {
    private var window: NSWindow!
    private var webView: WKWebView!
    private var hostProcess: Process?
    private var stdoutBuffer = ""
    private var stderrBuffer = ""
    private var loadedHost = false
    private var terminating = false

    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApplication.shared.setActivationPolicy(.regular)
        createWindow()
        showMessage(title: "Starting DSA Coach Next", body: "Starting the local runner and editor...")
        startHost()
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        true
    }

    func applicationWillTerminate(_ notification: Notification) {
        terminating = true
        stopHost()
    }

    private func createWindow() {
        let configuration = WKWebViewConfiguration()
        webView = WKWebView(frame: .zero, configuration: configuration)

        window = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: 1280, height: 860),
            styleMask: [.titled, .closable, .miniaturizable, .resizable],
            backing: .buffered,
            defer: false
        )
        window.center()
        window.title = "DSA Coach Next"
        window.contentView = webView
        window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
    }

    private func startHost() {
        guard let appRoot = locateAppRoot() else {
            logLine("Could not locate app root")
            showMessage(
                title: "Cannot find app files",
                body: "The desktop wrapper could not locate next/package.json. Rebuild the app from the repository checkout."
            )
            return
        }
        logLine("Using app root \(appRoot.path)")

        guard let bun = locateBun() else {
            logLine("Could not locate bun")
            showMessage(
                title: "Bun is required",
                body: "Install Bun, then rebuild or reopen DSA Coach Next. Checked /opt/homebrew/bin, /usr/local/bin, ~/.bun/bin, and PATH."
            )
            return
        }
        logLine("Using bun \(bun)")

        let supportDirectory = appSupportDirectory()
        let userDataDirectory = supportDirectory.appendingPathComponent("User Data", isDirectory: true)
        let cacheDirectory = supportDirectory.appendingPathComponent("Cache", isDirectory: true)
        let processCacheDirectory = cacheDirectory.appendingPathComponent("runner", isDirectory: true)
        try? FileManager.default.createDirectory(at: userDataDirectory, withIntermediateDirectories: true)
        try? FileManager.default.createDirectory(at: processCacheDirectory, withIntermediateDirectories: true)

        let process = Process()
        process.executableURL = URL(fileURLWithPath: bun)
        process.currentDirectoryURL = appRoot
        process.arguments = [
            "run",
            "src/cli/desktop-host.ts",
            "--port",
            "0",
            "--parent-pid",
            String(ProcessInfo.processInfo.processIdentifier)
        ]

        var environment = ProcessInfo.processInfo.environment
        environment["DSA_COACH_DESKTOP"] = "1"
        environment["DSA_COACH_USER_DATA_DIR"] = userDataDirectory.path
        environment["DSA_COACH_CACHE_ROOT"] = processCacheDirectory.path
        environment["DSA_COACH_BUNDLED_CACHE_ROOT"] = appRoot.appendingPathComponent(".runner-cache", isDirectory: true).path
        environment["XDG_CACHE_HOME"] = cacheDirectory.path
        environment["BUN_INSTALL_CACHE_DIR"] = cacheDirectory.appendingPathComponent("bun-install", isDirectory: true).path
        environment["PATH"] = launchPath(appRoot: appRoot, existing: environment["PATH"])
        process.environment = environment

        let stdout = Pipe()
        let stderr = Pipe()
        process.standardOutput = stdout
        process.standardError = stderr

        stdout.fileHandleForReading.readabilityHandler = { [weak self] handle in
            let data = handle.availableData
            guard !data.isEmpty, let text = String(data: data, encoding: .utf8) else { return }
            self?.handleStdout(text)
        }
        stderr.fileHandleForReading.readabilityHandler = { [weak self] handle in
            let data = handle.availableData
            guard !data.isEmpty, let text = String(data: data, encoding: .utf8) else { return }
            self?.stderrBuffer += text
        }
        process.terminationHandler = { [weak self] process in
            DispatchQueue.main.async {
                self?.handleHostExit(process)
            }
        }

        do {
            try process.run()
            logLine("Started host process \(process.processIdentifier)")
            hostProcess = process
        } catch {
            logLine("Failed to start host: \(error.localizedDescription)")
            showMessage(title: "Could not start local host", body: error.localizedDescription)
        }
    }

    private func handleStdout(_ text: String) {
        logLine("stdout: \(text.trimmingCharacters(in: .whitespacesAndNewlines))")
        stdoutBuffer += text
        let parts = stdoutBuffer.components(separatedBy: "\n")
        stdoutBuffer = parts.last ?? ""
        for rawLine in parts.dropLast() {
            let line = rawLine.trimmingCharacters(in: .whitespacesAndNewlines)
            guard line.hasPrefix("DSA_COACH_DESKTOP_URL=") else { continue }
            let urlText = String(line.dropFirst("DSA_COACH_DESKTOP_URL=".count))
            guard let url = URL(string: urlText) else { continue }
            DispatchQueue.main.async { [weak self] in
                self?.loadedHost = true
                self?.webView.load(URLRequest(url: url))
            }
        }
    }

    private func handleHostExit(_ process: Process) {
        logLine("Host exited with status \(process.terminationStatus)")
        guard !terminating else { return }
        stopHost()
        if loadedHost {
            showMessage(
                title: "Local runner stopped",
                body: "The local DSA Coach service exited. Close and reopen the app to start it again."
            )
            return
        }
        let details = stderrBuffer.trimmingCharacters(in: .whitespacesAndNewlines)
        showMessage(
            title: "Could not start DSA Coach Next",
            body: details.isEmpty ? "The local runner exited before it reported a startup URL." : details
        )
    }

    private func stopHost() {
        hostProcess?.terminationHandler = nil
        hostProcess?.terminate()
        logLine("Terminated host process")
        hostProcess = nil
    }

    private func showMessage(title: String, body: String) {
        let html = """
        <!doctype html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              margin: 0;
              min-height: 100vh;
              display: grid;
              place-items: center;
              background: #f6f7f2;
              color: #17201b;
              font: 15px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            }
            main {
              width: min(520px, calc(100vw - 48px));
              padding: 28px;
              border: 1px solid #d8ddd2;
              border-radius: 8px;
              background: white;
              box-shadow: 0 16px 40px rgba(30, 40, 32, 0.10);
            }
            h1 { margin: 0 0 12px; font-size: 22px; }
            p { margin: 0; line-height: 1.45; white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <main>
            <h1>\(htmlEscape(title))</h1>
            <p>\(htmlEscape(body))</p>
          </main>
        </body>
        </html>
        """
        webView.loadHTMLString(html, baseURL: nil)
    }
}

private func locateAppRoot() -> URL? {
    if let override = ProcessInfo.processInfo.environment["DSA_COACH_NEXT_APP_ROOT"], isAppRoot(URL(fileURLWithPath: override)) {
        return URL(fileURLWithPath: override)
    }

    if let bundledRoot = Bundle.main.resourceURL?.appendingPathComponent("app", isDirectory: true),
       isAppRoot(bundledRoot) {
        return bundledRoot
    }

    if let marker = Bundle.main.url(forResource: "app-root", withExtension: nil),
       let value = try? String(contentsOf: marker, encoding: .utf8) {
        let path = value.trimmingCharacters(in: .whitespacesAndNewlines)
        let url: URL? = path.hasPrefix("/")
            ? URL(fileURLWithPath: path)
            : Bundle.main.resourceURL?.appendingPathComponent(path, isDirectory: true)
        if isAppRoot(url) { return url }
    }

    let relativeRoot = Bundle.main.bundleURL
        .deletingLastPathComponent()
        .deletingLastPathComponent()
        .deletingLastPathComponent()
    return isAppRoot(relativeRoot) ? relativeRoot : nil
}

private func isAppRoot(_ url: URL) -> Bool {
    FileManager.default.fileExists(atPath: url.appendingPathComponent("package.json").path)
}

private func isAppRoot(_ url: URL?) -> Bool {
    guard let url else { return false }
    return isAppRoot(url)
}

private func locateBun() -> String? {
    if let bundledBun = Bundle.main.resourceURL?.appendingPathComponent("bin/bun").path,
       FileManager.default.isExecutableFile(atPath: bundledBun) {
        return bundledBun
    }

    var candidates = [
        "/opt/homebrew/bin/bun",
        "/usr/local/bin/bun",
        "\(NSHomeDirectory())/.bun/bin/bun"
    ]

    if let path = ProcessInfo.processInfo.environment["PATH"] {
        candidates.append(contentsOf: path.split(separator: ":").map { "\($0)/bun" })
    }

    return candidates.first { FileManager.default.isExecutableFile(atPath: $0) }
}

private func launchPath(appRoot: URL, existing: String?) -> String {
    var entries = [
        appRoot.appendingPathComponent("node_modules/.bin").path,
        appRoot.appendingPathComponent(".runner-cache/lsp/bin").path
    ]
    if let bundledBin = Bundle.main.resourceURL?.appendingPathComponent("bin").path {
        entries.append(bundledBin)
    }
    entries.append(existing ?? "/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin")
    return entries.joined(separator: ":")
}

private func appSupportDirectory() -> URL {
    let base = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first
        ?? URL(fileURLWithPath: NSHomeDirectory()).appendingPathComponent("Library/Application Support", isDirectory: true)
    let directory = base.appendingPathComponent("DSA Coach Next", isDirectory: true)
    try? FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
    return directory
}

private func htmlEscape(_ value: String) -> String {
    value
        .replacingOccurrences(of: "&", with: "&amp;")
        .replacingOccurrences(of: "<", with: "&lt;")
        .replacingOccurrences(of: ">", with: "&gt;")
        .replacingOccurrences(of: "\"", with: "&quot;")
        .replacingOccurrences(of: "'", with: "&#39;")
}

private func logLine(_ message: String) {
    let line = "[\(Date())] \(message)\n"
    guard let library = FileManager.default.urls(for: .libraryDirectory, in: .userDomainMask).first else { return }
    let directory = library.appendingPathComponent("Logs/DSA Coach Next", isDirectory: true)
    try? FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
    let url = directory.appendingPathComponent("wrapper.log")
    guard let data = line.data(using: .utf8) else { return }
    if !FileManager.default.fileExists(atPath: url.path) {
        FileManager.default.createFile(atPath: url.path, contents: nil)
    }
    guard let handle = try? FileHandle(forWritingTo: url) else { return }
    do {
        try handle.seekToEnd()
        try handle.write(contentsOf: data)
        try handle.close()
    } catch {
        try? handle.close()
    }
}
