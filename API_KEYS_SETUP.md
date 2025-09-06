# API Keys Setup Guide

This guide will help you add your Gemini API key to the `.env` file for natural language to SQL conversion.

## 🔑 **Required API Key**

### **Google Gemini API Key** (Required for AI Query Feature)
- **Purpose**: Convert human language questions to SQL queries
- **Get it from**: https://makersuite.google.com/app/apikey
- **Cost**: Free tier available with generous limits
- **Usage**: Natural language to SQL conversion for data queries

## 📝 **How to Add Your Key**

1. **Open the `.env` file** in your project root
2. **Replace the placeholder value** with your actual Gemini API key:

```env
# Replace with your actual Gemini API key
GEMINI_API_KEY="your-actual-gemini-key-here"
```

## 🚀 **Enhanced Features with Gemini API Key**

### With Gemini API Key:
- **Natural Language Queries**: Ask questions about your inventory in plain English
- **SQL Generation**: AI converts your questions to SQL queries automatically
- **Data Insights**: Get instant answers about your warehouse data
- **Smart Analysis**: AI understands context and generates relevant queries

## 🔒 **Security Best Practices**

1. **Never commit `.env` to version control**
2. **Use different keys for development/production**
3. **Rotate keys regularly**
4. **Monitor API usage and costs**

## 💡 **Getting Started Without API Key**

The system works perfectly without the Gemini API key! You'll have:
- ✅ Full database functionality
- ✅ ML logic for shelf-life management
- ✅ Dead stock detection
- ✅ Warehouse capacity management
- ✅ Order processing with smart recommendations

The Gemini API key only adds **natural language query functionality** on top of the core features.

## 🧪 **Testing Your Setup**

After adding your keys:

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Test the application**:
   - Visit `http://localhost:3000`
   - Try ordering products to test ML logic
   - Check dashboard for real-time data

3. **Verify API connectivity** (if you added the Gemini key):
   - Visit `/query` page to test natural language queries
   - Try asking questions like "Show me all products that expire soon"
   - Check browser console for any API errors

## 📊 **Current Status**

Your system is **fully functional** with:
- ✅ SQLite database connected
- ✅ Sample data loaded
- ✅ All API endpoints working
- ✅ Frontend connected to backend
- ✅ ML logic for inventory management

The Gemini API key is **optional** and only adds natural language query functionality!
