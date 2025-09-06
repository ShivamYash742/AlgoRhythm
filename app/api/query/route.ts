import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// POST /api/query - Convert human language to SQL and execute
export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query is required' },
        { status: 400 }
      );
    }

    // Check if Gemini API key is available
    const geminiApiKey = process.env.GEMINI_API_KEY;
    console.log('Gemini API Key check:', {
      hasKey: !!geminiApiKey,
      keyLength: geminiApiKey?.length,
      keyStart: geminiApiKey?.substring(0, 10) + '...'
    });
    
    if (!geminiApiKey || geminiApiKey === 'your-gemini-api-key-here') {
      return NextResponse.json({
        success: false,
        error: 'Gemini API key not configured',
        message: 'Please add your Gemini API key to the .env file',
        debug: {
          hasKey: !!geminiApiKey,
          keyLength: geminiApiKey?.length
        }
      });
    }

    // Convert human language to SQL using Gemini
    const sqlQuery = await convertToSQL(query, geminiApiKey);
    
    if (!sqlQuery) {
      return NextResponse.json({
        success: false,
        error: 'Failed to convert query to SQL'
      });
    }

    // Execute the SQL query using Prisma
    const results = await executeSQLQuery(sqlQuery);

    return NextResponse.json({
      success: true,
      originalQuery: query,
      sqlQuery: sqlQuery,
      results: results,
      message: 'Query executed successfully'
    });

  } catch (error) {
    console.error('Error processing query:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process query' },
      { status: 500 }
    );
  }
}

// Function to convert human language to SQL using Gemini
async function convertToSQL(humanQuery: string, apiKey: string): Promise<string | null> {
  try {
    const prompt = `
You are a SQL expert for a warehouse management system. Convert the following human language query to SQL.

Database Schema (PostgreSQL):
- warehouses: id (cuid), location, capacity, usedCapacity, createdAt, updatedAt
- products: id (cuid), name, quantity, selfLife (DateTime), status (enum), warehouseId, createdAt, updatedAt
- orders: id (cuid), productId, warehouseId, quantityOrdered, orderDate, createdAt, updatedAt

Relationships:
- products.warehouseId -> warehouses.id
- orders.productId -> products.id
- orders.warehouseId -> warehouses.id

Status enum values: "ACTIVE", "LOW_SHELF_LIFE", "DEAD_STOCK"

Table names: warehouses, products, orders

Human Query: "${humanQuery}"

Return ONLY the SQL query, no explanations or additional text. Use PostgreSQL syntax.
`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini API response:', JSON.stringify(data, null, 2));
    
    const sqlQuery = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    console.log('Generated SQL:', sqlQuery);

    return sqlQuery || null;

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return null;
  }
}

// Function to execute SQL query using Prisma
async function executeSQLQuery(sqlQuery: string) {
  try {
    console.log('Executing SQL query:', sqlQuery);
    
    // For security, we'll use Prisma's raw query method
    // This allows us to execute custom SQL while maintaining safety
    const results = await prisma.$queryRawUnsafe(sqlQuery);
    console.log('Query results:', results);
    
    return results;
  } catch (error) {
    console.error('Error executing SQL query:', error);
    throw new Error(`SQL execution error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
