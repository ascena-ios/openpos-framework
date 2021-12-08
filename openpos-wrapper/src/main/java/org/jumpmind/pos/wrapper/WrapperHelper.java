package org.jumpmind.pos.wrapper;

import java.io.FileNotFoundException;
import java.io.IOException;

public class WrapperHelper {

		
	public static void run(String[] args, String applHomeDir, String configFileName, String jarFileName) {
		
		checkArgs(args);
		
        WrapperService service = WrapperService.getInstance();
        try {
            service.loadConfig(applHomeDir, configFileName, jarFileName);
        } catch (FileNotFoundException e) {
            System.out.println("Missing config file " + configFileName);
            System.out.println(e.getMessage());
            System.exit(Constants.RC_MISSING_CONFIG_FILE);
        } catch (IOException e) {
            System.out.println("Cannot read config file " + configFileName);
            System.out.println(e.getMessage());
            System.exit(Constants.RC_FAIL_READ_CONFIG_FILE);
        }

        try {
            if (args[0].equalsIgnoreCase("start")) {
                service.start();
            } else if (args[0].equalsIgnoreCase("exec")) {
                service.execJava(false);
            } else if (args[0].equalsIgnoreCase("init")) {
                service.init();
            } else if (args[0].equalsIgnoreCase("stop")) {
                service.stop();
            } else if (args[0].equalsIgnoreCase("restart")) {    
                service.restart();
            } else if (args[0].equalsIgnoreCase("install")) {
                service.install();
            } else if (args[0].equalsIgnoreCase("uninstall")) {
                service.uninstall();
            } else if (args[0].equalsIgnoreCase("status")) {
                service.status();
            } else if (args[0].equalsIgnoreCase("console")) {
                service.console();
            } else if (args[0].equalsIgnoreCase("install-update")) {
                if (args.length != 3) {
                    System.out.println("ERROR: invalid number of arguments; expected 4");
                    printUsage();
                    System.exit(Constants.RC_INVALID_ARGUMENT);
                    return;
                }

                final String installArchive = args[2];

                service.installUpdate(installArchive);
            } else {
                System.out.println("ERROR: Invalid argument");
                printUsage();
                System.exit(Constants.RC_INVALID_ARGUMENT);
            }
        } catch (WrapperException e) {
            System.out.println("Error " + e.getErrorCode() + ": " + e.getMessage());
            if (e.getCause() != null) {
                System.out.println("Exception " + e.getCause().getClass().getSimpleName() + ": "
                        + e.getCause().getMessage());
            }
            if (e.getNativeErrorCode() > 0) {
                System.out.println("Native error " + e.getErrorCode());    
            }
            System.exit(e.getErrorCode());
        } catch (Throwable ex) {
            ex.printStackTrace();
            System.exit(-1);
        }
	}
	
	private static void checkArgs(String[] args) {
        if (args.length < 1) {
            printUsage();
            System.exit(Constants.RC_BAD_USAGE);
        }
	}

    protected static void printUsage() {
        System.out.println("Usage: <start|stop|restart|install|remove|console>");
        System.out.println("   start      - Start service");
        System.out.println("   stop       - Stop service");
        System.out.println("   restart    - Restart service");
        System.out.println("   install    - Install service");
        System.out.println("   uninstall  - Uninstall service");
        System.out.println("   status     - Status of service");
        System.out.println("   console    - Run from console");
    }
}
