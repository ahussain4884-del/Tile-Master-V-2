import { GoogleGenAI, SchemaType } from "@google/genai";
import { Product, Supplier, Invoice } from "../types";

// Initialize Gemini Client
const apiKey = process.env.API_KEY || ''; 
// Note: In a real app, never expose keys on client side. 
// For this demo structure, we assume process.env.API_KEY is available or injected.

const ai = new GoogleGenAI({ apiKey });

export const generateBusinessInsight = async (
  products: Product[],
  suppliers: Supplier[],
  recentInvoices: Invoice[]
): Promise<string> => {
  
  if (!apiKey) return "API Key not configured. Please set process.env.API_KEY.";

  const lowStock = products.filter(p => p.stockQty <= p.minStockAlert).map(p => p.name);
  const totalSales = recentInvoices.reduce((acc, curr) => acc + curr.total, 0);
  const topSupplier = suppliers.sort((a, b) => b.currentBalance - a.currentBalance)[0]?.name || "None";

  const prompt = `
    You are a business analyst for a Tile & Sanitary Shop.
    Here is the current snapshot:
    - Low Stock Items: ${lowStock.join(', ')}
    - Total Recent Revenue: ${totalSales}
    - Supplier with highest outstanding balance: ${topSupplier}

    Provide a concise, 3-bullet point executive summary advising the owner on:
    1. Inventory restocking priority.
    2. Cash flow management regarding the supplier.
    3. A sales strategy based on revenue.
    
    Keep it professional and encouraging.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No insights generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Unable to generate insights at this time.";
  }
};
