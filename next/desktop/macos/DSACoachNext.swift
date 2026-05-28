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
        createApplicationMenu()
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

    private func createApplicationMenu() {
        let mainMenu = NSMenu()
        NSApp.mainMenu = mainMenu

        let appMenu = addMenu(title: "DSA Coach Next", to: mainMenu)
        appMenu.addItem(commandItem(title: "About DSA Coach Next", action: #selector(showAboutPanel(_:))))
        appMenu.addItem(NSMenuItem.separator())
        appMenu.addItem(commandItem(title: "Settings...", action: #selector(openSettings(_:)), keyEquivalent: ","))
        appMenu.addItem(NSMenuItem.separator())

        let servicesMenu = NSMenu(title: "Services")
        NSApp.servicesMenu = servicesMenu
        let servicesItem = NSMenuItem(title: "Services", action: nil, keyEquivalent: "")
        servicesItem.submenu = servicesMenu
        appMenu.addItem(servicesItem)
        appMenu.addItem(NSMenuItem.separator())
        appMenu.addItem(systemItem(title: "Hide DSA Coach Next", action: #selector(NSApplication.hide(_:)), keyEquivalent: "h"))
        appMenu.addItem(systemItem(title: "Hide Others", action: #selector(NSApplication.hideOtherApplications(_:)), keyEquivalent: "h", modifiers: [.command, .option]))
        appMenu.addItem(systemItem(title: "Show All", action: #selector(NSApplication.unhideAllApplications(_:))))
        appMenu.addItem(NSMenuItem.separator())
        appMenu.addItem(systemItem(title: "Quit DSA Coach Next", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q"))

        let fileMenu = addMenu(title: "File", to: mainMenu)
        fileMenu.addItem(commandItem(title: "Import Progress...", action: #selector(importProgress(_:)), keyEquivalent: "o"))
        fileMenu.addItem(commandItem(title: "Export Progress...", action: #selector(exportProgress(_:)), keyEquivalent: "e"))
        fileMenu.addItem(commandItem(title: "Export Coach Log...", action: #selector(exportCoachLog(_:)), keyEquivalent: "e", modifiers: [.command, .shift]))

        let editMenu = addMenu(title: "Edit", to: mainMenu)
        editMenu.addItem(responderItem(title: "Undo", action: Selector(("undo:")), keyEquivalent: "z"))
        editMenu.addItem(responderItem(title: "Redo", action: Selector(("redo:")), keyEquivalent: "z", modifiers: [.command, .shift]))
        editMenu.addItem(NSMenuItem.separator())
        editMenu.addItem(responderItem(title: "Cut", action: #selector(NSText.cut(_:)), keyEquivalent: "x"))
        editMenu.addItem(responderItem(title: "Copy", action: #selector(NSText.copy(_:)), keyEquivalent: "c"))
        editMenu.addItem(responderItem(title: "Paste", action: #selector(NSText.paste(_:)), keyEquivalent: "v"))
        editMenu.addItem(responderItem(title: "Select All", action: #selector(NSText.selectAll(_:)), keyEquivalent: "a"))

        let viewMenu = addMenu(title: "View", to: mainMenu)
        viewMenu.addItem(commandItem(title: "Reload", action: #selector(reloadWebView(_:)), keyEquivalent: "r"))
        viewMenu.addItem(NSMenuItem.separator())
        viewMenu.addItem(commandItem(title: "Toggle Sidebar", action: #selector(toggleSidebar(_:)), keyEquivalent: "s", modifiers: [.command, .option]))
        viewMenu.addItem(commandItem(title: "Toggle Coach", action: #selector(toggleCoach(_:)), keyEquivalent: "c", modifiers: [.command, .option]))
        viewMenu.addItem(commandItem(title: "Toggle Focus Mode", action: #selector(toggleFocusMode(_:)), keyEquivalent: "f", modifiers: [.command, .option]))
        viewMenu.addItem(NSMenuItem.separator())
        viewMenu.addItem(responderItem(title: "Enter Full Screen", action: #selector(NSWindow.toggleFullScreen(_:)), keyEquivalent: "f", modifiers: [.command, .control]))

        let navigateMenu = addMenu(title: "Navigate", to: mainMenu)
        navigateMenu.addItem(commandItem(title: "Dashboard", action: #selector(openDashboard(_:)), keyEquivalent: "1"))
        navigateMenu.addItem(commandItem(title: "Search Course", action: #selector(focusSearch(_:)), keyEquivalent: "k"))
        navigateMenu.addItem(NSMenuItem.separator())
        navigateMenu.addItem(commandItem(title: "Back", action: #selector(goBack(_:)), keyEquivalent: "["))
        navigateMenu.addItem(commandItem(title: "Forward", action: #selector(goForward(_:)), keyEquivalent: "]"))

        let windowMenu = addMenu(title: "Window", to: mainMenu)
        NSApp.windowsMenu = windowMenu
        windowMenu.addItem(responderItem(title: "Minimize", action: #selector(NSWindow.miniaturize(_:)), keyEquivalent: "m"))
        windowMenu.addItem(responderItem(title: "Zoom", action: #selector(NSWindow.zoom(_:))))
        windowMenu.addItem(NSMenuItem.separator())
        windowMenu.addItem(systemItem(title: "Bring All to Front", action: #selector(NSApplication.arrangeInFront(_:))))
    }

    private func createWindow() {
        let configuration = WKWebViewConfiguration()
        webView = WKWebView(frame: .zero, configuration: configuration)
        webView.allowsBackForwardNavigationGestures = true

        window = NSWindow(
            contentRect: initialWindowFrame(),
            styleMask: [.titled, .closable, .miniaturizable, .resizable],
            backing: .buffered,
            defer: false
        )
        window.minSize = NSSize(width: 1120, height: 740)
        window.tabbingMode = .preferred
        window.setFrameAutosaveName("MainWindow")
        if !window.setFrameUsingName("MainWindow") {
            window.center()
        }
        window.title = "DSA Coach Next"
        window.contentView = webView
        window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
    }

    @objc private func showAboutPanel(_ sender: Any?) {
        NSApp.orderFrontStandardAboutPanel(options: [
            .applicationName: "DSA Coach Next",
            .applicationVersion: Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "0.1.0",
            .credits: NSAttributedString(string: "Local, offline-first coding practice.")
        ])
    }

    @objc private func openSettings(_ sender: Any?) {
        sendWebCommand("open-settings")
    }

    @objc private func importProgress(_ sender: Any?) {
        sendWebCommand("import-progress")
    }

    @objc private func exportProgress(_ sender: Any?) {
        sendWebCommand("export-progress")
    }

    @objc private func exportCoachLog(_ sender: Any?) {
        sendWebCommand("export-coach-log")
    }

    @objc private func openDashboard(_ sender: Any?) {
        sendWebCommand("open-dashboard")
    }

    @objc private func focusSearch(_ sender: Any?) {
        sendWebCommand("focus-search")
    }

    @objc private func toggleSidebar(_ sender: Any?) {
        sendWebCommand("toggle-sidebar")
    }

    @objc private func toggleCoach(_ sender: Any?) {
        sendWebCommand("toggle-coach")
    }

    @objc private func toggleFocusMode(_ sender: Any?) {
        sendWebCommand("toggle-focus")
    }

    @objc private func reloadWebView(_ sender: Any?) {
        webView.reload()
    }

    @objc private func goBack(_ sender: Any?) {
        if webView.canGoBack { webView.goBack() }
    }

    @objc private func goForward(_ sender: Any?) {
        if webView.canGoForward { webView.goForward() }
    }

    private func sendWebCommand(_ command: String) {
        let escaped = command
            .replacingOccurrences(of: "\\", with: "\\\\")
            .replacingOccurrences(of: "'", with: "\\'")
            .replacingOccurrences(of: "\n", with: "\\n")
        webView.evaluateJavaScript("if (window.dsaCoachCommand) window.dsaCoachCommand('\(escaped)');")
    }

    private func initialWindowFrame() -> NSRect {
        let visible = NSScreen.main?.visibleFrame ?? NSRect(x: 0, y: 0, width: 1440, height: 900)
        let maxWidth = max(1120, visible.width - 80)
        let maxHeight = max(740, visible.height - 80)
        let width = min(max(1320, visible.width * 0.78), maxWidth)
        let height = min(max(860, visible.height * 0.82), maxHeight)
        return NSRect(
            x: visible.minX + (visible.width - width) / 2,
            y: visible.minY + (visible.height - height) / 2,
            width: width,
            height: height
        )
    }

    private func addMenu(title: String, to mainMenu: NSMenu) -> NSMenu {
        let item = NSMenuItem()
        let menu = NSMenu(title: title)
        item.submenu = menu
        mainMenu.addItem(item)
        return menu
    }

    private func commandItem(
        title: String,
        action: Selector?,
        keyEquivalent: String = "",
        modifiers: NSEvent.ModifierFlags = [.command]
    ) -> NSMenuItem {
        let item = NSMenuItem(title: title, action: action, keyEquivalent: keyEquivalent)
        item.target = self
        item.keyEquivalentModifierMask = modifiers
        return item
    }

    private func responderItem(
        title: String,
        action: Selector?,
        keyEquivalent: String = "",
        modifiers: NSEvent.ModifierFlags = [.command]
    ) -> NSMenuItem {
        let item = NSMenuItem(title: title, action: action, keyEquivalent: keyEquivalent)
        item.keyEquivalentModifierMask = modifiers
        return item
    }

    private func systemItem(
        title: String,
        action: Selector?,
        keyEquivalent: String = "",
        modifiers: NSEvent.ModifierFlags = [.command]
    ) -> NSMenuItem {
        let item = NSMenuItem(title: title, action: action, keyEquivalent: keyEquivalent)
        item.target = NSApp
        item.keyEquivalentModifierMask = modifiers
        return item
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
    let home = NSHomeDirectory()
    var entries = [
        appRoot.appendingPathComponent("node_modules/.bin").path,
        appRoot.appendingPathComponent(".runner-cache/lsp/bin").path,
        appRoot.appendingPathComponent(".runner-cache/toolchains/python/bin").path,
        appRoot.appendingPathComponent(".runner-cache/toolchains/go/bin").path,
        appRoot.appendingPathComponent(".runner-cache/toolchains/java/bin").path,
        "\(home)/.local/bin",
        "\(home)/.pyenv/shims",
        "\(home)/.bun/bin",
        "/opt/homebrew/bin",
        "/usr/local/bin",
        "/usr/bin",
        "/bin",
        "/usr/sbin",
        "/sbin"
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
