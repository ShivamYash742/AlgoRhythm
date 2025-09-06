import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    // Test database connection
    const connectionTest = await prisma.$queryRaw`SELECT 1 as result`;
    
    // Get environment variables
    const envVars = {
      databaseUrl: process.env.DATABASE_URL ? "Set" : "Not set",
      geminiApiKey: process.env.GEMINI_API_KEY ? "Set" : "Not set", 
      nodeEnv: process.env.NODE_ENV || "Not set"
    };
    
    return Response.json({
      success: true,
      dbConnection: "Connected successfully",
      connectionTest,
      envVars,
      systemInfo: {
        nodeVersion: process.version,
        platform: process.platform
      }
    });
  } catch (error) {
    console.error("Database connection test failed:", error);
    return Response.json({
      success: false,
      error: error.message,
      stack: error.stack,
      envVars: {
        databaseUrl: process.env.DATABASE_URL ? "Set" : "Not set",
        geminiApiKey: process.env.GEMINI_API_KEY ? "Set" : "Not set",
        nodeEnv: process.env.NODE_ENV || "Not set"
      }
    }, { status: 500 });
  }
}
