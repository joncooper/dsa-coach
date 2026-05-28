import AppKit
import Foundation

let arguments = CommandLine.arguments
guard arguments.count == 2 else {
    fputs("Usage: swift scripts/generate-macos-icon.swift <output.iconset>\n", stderr)
    exit(2)
}

let outputDirectory = URL(fileURLWithPath: arguments[1], isDirectory: true)
try FileManager.default.createDirectory(at: outputDirectory, withIntermediateDirectories: true)

let iconFiles: [(name: String, pixels: Int)] = [
    ("icon_16x16.png", 16),
    ("icon_16x16@2x.png", 32),
    ("icon_32x32.png", 32),
    ("icon_32x32@2x.png", 64),
    ("icon_128x128.png", 128),
    ("icon_128x128@2x.png", 256),
    ("icon_256x256.png", 256),
    ("icon_256x256@2x.png", 512),
    ("icon_512x512.png", 512),
    ("icon_512x512@2x.png", 1024)
]

for file in iconFiles {
    guard let data = renderIcon(pixels: file.pixels) else {
        fputs("Failed to render \(file.name)\n", stderr)
        exit(1)
    }
    try data.write(to: outputDirectory.appendingPathComponent(file.name))
}

func renderIcon(pixels: Int) -> Data? {
    guard let rep = NSBitmapImageRep(
        bitmapDataPlanes: nil,
        pixelsWide: pixels,
        pixelsHigh: pixels,
        bitsPerSample: 8,
        samplesPerPixel: 4,
        hasAlpha: true,
        isPlanar: false,
        colorSpaceName: .deviceRGB,
        bytesPerRow: 0,
        bitsPerPixel: 0
    ) else {
        return nil
    }

    rep.size = NSSize(width: pixels, height: pixels)

    guard let context = NSGraphicsContext(bitmapImageRep: rep) else {
        return nil
    }

    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = context
    context.shouldAntialias = true
    context.imageInterpolation = .high

    let cg = context.cgContext
    cg.clear(CGRect(x: 0, y: 0, width: pixels, height: pixels))
    cg.translateBy(x: 0, y: CGFloat(pixels))
    cg.scaleBy(x: CGFloat(pixels) / 1024, y: -CGFloat(pixels) / 1024)

    drawIcon()

    NSGraphicsContext.restoreGraphicsState()
    return rep.representation(using: .png, properties: [:])
}

func drawIcon() {
    let base = roundedRect(x: 58, y: 58, width: 908, height: 908, radius: 214)
    let shadow = roundedRect(x: 74, y: 98, width: 876, height: 834, radius: 202)

    fill(shadow, color: color(0x0A1214, alpha: 0.22))

    if let gradient = NSGradient(colors: [
        color(0x08747A),
        color(0x203236)
    ]) {
        gradient.draw(in: base, angle: -92)
    } else {
        fill(base, color: color(0x213235))
    }

    stroke(base, color: color(0xF7F5EF, alpha: 0.18), width: 11)

    let topGlow = roundedRect(x: 108, y: 92, width: 808, height: 380, radius: 180)
    fill(topGlow, color: color(0xB8F1DD, alpha: 0.10))

    drawLearningPath()
    drawBook()
    drawCodeMarks()
}

func drawLearningPath() {
    let path = NSBezierPath()
    path.move(to: NSPoint(x: 316, y: 284))
    path.curve(to: NSPoint(x: 512, y: 218), controlPoint1: NSPoint(x: 388, y: 282), controlPoint2: NSPoint(x: 432, y: 218))
    path.curve(to: NSPoint(x: 708, y: 284), controlPoint1: NSPoint(x: 592, y: 218), controlPoint2: NSPoint(x: 636, y: 282))
    path.lineCapStyle = .round
    path.lineJoinStyle = .round
    path.lineWidth = 24
    stroke(path, color: color(0x74D790, alpha: 0.42), width: 24)

    drawNode(x: 316, y: 284, radius: 32, fillColor: color(0xF7F5EF), strokeColor: color(0x74D790))
    drawNode(x: 512, y: 218, radius: 32, fillColor: color(0xF7F5EF), strokeColor: color(0x74D790))
    drawNode(x: 708, y: 284, radius: 32, fillColor: color(0xF7F5EF), strokeColor: color(0x74D790))
}

func drawBook() {
    let leftPage = NSBezierPath()
    leftPage.move(to: NSPoint(x: 240, y: 332))
    leftPage.curve(to: NSPoint(x: 498, y: 374), controlPoint1: NSPoint(x: 324, y: 314), controlPoint2: NSPoint(x: 416, y: 328))
    leftPage.line(to: NSPoint(x: 498, y: 744))
    leftPage.curve(to: NSPoint(x: 240, y: 680), controlPoint1: NSPoint(x: 404, y: 700), controlPoint2: NSPoint(x: 318, y: 680))
    leftPage.close()

    let rightPage = NSBezierPath()
    rightPage.move(to: NSPoint(x: 526, y: 374))
    rightPage.curve(to: NSPoint(x: 784, y: 332), controlPoint1: NSPoint(x: 608, y: 328), controlPoint2: NSPoint(x: 700, y: 314))
    rightPage.line(to: NSPoint(x: 784, y: 680))
    rightPage.curve(to: NSPoint(x: 526, y: 744), controlPoint1: NSPoint(x: 706, y: 680), controlPoint2: NSPoint(x: 620, y: 700))
    rightPage.close()

    fill(leftPage, color: color(0xFFFDF8))
    fill(rightPage, color: color(0xFFFDF8))
    stroke(leftPage, color: color(0xDDD7CA), width: 9)
    stroke(rightPage, color: color(0xDDD7CA), width: 9)

    let spine = NSBezierPath()
    spine.move(to: NSPoint(x: 512, y: 378))
    spine.curve(to: NSPoint(x: 512, y: 752), controlPoint1: NSPoint(x: 502, y: 510), controlPoint2: NSPoint(x: 502, y: 624))
    spine.lineCapStyle = .round
    stroke(spine, color: color(0xD7E0DA), width: 13)
}

func drawCodeMarks() {
    let teal = color(0x096B72)
    let amber = color(0xA66A16)

    let left = NSBezierPath()
    left.move(to: NSPoint(x: 408, y: 478))
    left.line(to: NSPoint(x: 336, y: 526))
    left.line(to: NSPoint(x: 408, y: 574))
    left.lineCapStyle = .round
    left.lineJoinStyle = .round
    stroke(left, color: teal, width: 32)

    let right = NSBezierPath()
    right.move(to: NSPoint(x: 616, y: 478))
    right.line(to: NSPoint(x: 688, y: 526))
    right.line(to: NSPoint(x: 616, y: 574))
    right.lineCapStyle = .round
    right.lineJoinStyle = .round
    stroke(right, color: teal, width: 32)

    let slash = NSBezierPath()
    slash.move(to: NSPoint(x: 552, y: 464))
    slash.line(to: NSPoint(x: 472, y: 594))
    slash.lineCapStyle = .round
    stroke(slash, color: amber, width: 28)
}

func drawNode(x: CGFloat, y: CGFloat, radius: CGFloat, fillColor: NSColor, strokeColor: NSColor) {
    let circle = NSBezierPath(ovalIn: NSRect(x: x - radius, y: y - radius, width: radius * 2, height: radius * 2))
    fill(circle, color: fillColor)
    stroke(circle, color: strokeColor, width: 13)
}

func roundedRect(x: CGFloat, y: CGFloat, width: CGFloat, height: CGFloat, radius: CGFloat) -> NSBezierPath {
    NSBezierPath(roundedRect: NSRect(x: x, y: y, width: width, height: height), xRadius: radius, yRadius: radius)
}

func fill(_ path: NSBezierPath, color: NSColor) {
    color.setFill()
    path.fill()
}

func stroke(_ path: NSBezierPath, color: NSColor, width: CGFloat) {
    color.setStroke()
    path.lineWidth = width
    path.stroke()
}

func color(_ hex: Int, alpha: CGFloat = 1) -> NSColor {
    let red = CGFloat((hex >> 16) & 0xff) / 255
    let green = CGFloat((hex >> 8) & 0xff) / 255
    let blue = CGFloat(hex & 0xff) / 255
    return NSColor(calibratedRed: red, green: green, blue: blue, alpha: alpha)
}
