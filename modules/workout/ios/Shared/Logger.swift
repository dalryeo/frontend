import os.log
import Foundation

final class DevLogger {
    private let logger: Logger
    
    public static func create(category: String) -> DevLogger {
        return DevLogger(category: category)
    }
    
    private init(category: String) {
        self.logger = Logger(
            subsystem: Bundle.main.bundleIdentifier ?? "com.workout.unknown.app",
            category: category
        )
    }
    
    public func debug(_ message: String) {
        logger.debug("\(message)")
    }
    
    public func info(_ message: String) {
        logger.info("\(message)")
    }
    
    public func notice(_ message: String) {
        logger.notice("\(message)")
    }
    
    public func warning(_ message: String) {
        logger.warning("\(message)")
    }
    
    public func error(_ message: String) {
        logger.error("\(message)")
    }
    
    public func fault(_ message: String) {
        logger.fault("\(message)")
    }
}

#if os(watchOS)
let WorkoutLogger = DevLogger.create(category: "WorkoutManagerWatch")
#else
let WorkoutLogger = DevLogger.create(category: "WorkoutManager")
#endif
