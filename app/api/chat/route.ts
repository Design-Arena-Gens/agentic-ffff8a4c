import { NextRequest, NextResponse } from 'next/server'

// Agent tools
const tools = [
  {
    name: 'web_search',
    description: 'Search the web for current information, news, or facts',
    parameters: {
      query: 'string - the search query'
    }
  },
  {
    name: 'calculator',
    description: 'Perform mathematical calculations',
    parameters: {
      expression: 'string - the mathematical expression to evaluate'
    }
  },
  {
    name: 'get_weather',
    description: 'Get current weather information for a location',
    parameters: {
      location: 'string - the city or location name'
    }
  },
  {
    name: 'currency_converter',
    description: 'Convert between different currencies',
    parameters: {
      amount: 'number - the amount to convert',
      from: 'string - source currency code (e.g., USD)',
      to: 'string - target currency code (e.g., EUR)'
    }
  }
]

// Tool execution functions
async function executeTool(toolName: string, parameters: any): Promise<any> {
  switch (toolName) {
    case 'web_search':
      return simulateWebSearch(parameters.query)

    case 'calculator':
      return executeCalculator(parameters.expression)

    case 'get_weather':
      return simulateGetWeather(parameters.location)

    case 'currency_converter':
      return simulateCurrencyConversion(parameters)

    default:
      return { error: 'Unknown tool' }
  }
}

function simulateWebSearch(query: string) {
  // Simulate web search results
  const results = [
    {
      title: `Information about "${query}"`,
      snippet: `This is simulated search result for "${query}". In a production system, this would connect to a real search API like Google, Bing, or Brave Search.`,
      url: 'https://example.com'
    }
  ]
  return { results, query }
}

function executeCalculator(expression: string) {
  try {
    // Safe eval alternative - only allow basic math operations
    const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '')
    const result = Function(`'use strict'; return (${sanitized})`)()
    return { expression, result }
  } catch (error) {
    return { error: 'Invalid mathematical expression' }
  }
}

function simulateGetWeather(location: string) {
  // Simulate weather data
  const conditions = ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy', 'Clear']
  const condition = conditions[Math.floor(Math.random() * conditions.length)]
  const temperature = Math.floor(Math.random() * 30) + 10

  return {
    location,
    condition,
    temperature: `${temperature}°C`,
    humidity: `${Math.floor(Math.random() * 40) + 40}%`,
    note: 'This is simulated weather data. In production, this would connect to a real weather API.'
  }
}

function simulateCurrencyConversion({ amount, from, to }: any) {
  // Simulate currency conversion with mock rates
  const rates: { [key: string]: number } = {
    'USD': 1.0,
    'EUR': 0.92,
    'GBP': 0.79,
    'JPY': 148.5,
    'CAD': 1.36,
    'AUD': 1.52
  }

  const fromRate = rates[from.toUpperCase()] || 1
  const toRate = rates[to.toUpperCase()] || 1
  const result = (amount / fromRate) * toRate

  return {
    amount,
    from: from.toUpperCase(),
    to: to.toUpperCase(),
    result: result.toFixed(2),
    note: 'This uses simulated exchange rates. In production, this would use real-time rates from a currency API.'
  }
}

// Simple agentic reasoning
function analyzeUserIntent(userMessage: string): { needsTool: boolean, suggestedTool?: string, parameters?: any } {
  const message = userMessage.toLowerCase()

  // Check for calculation intent
  if (message.match(/calculate|compute|what is|solve|\+|\-|\*|\/|\d+\s*[\+\-\*\/]/)) {
    const expression = userMessage.match(/[\d+\-*/().\s]+/)?.[0]?.trim()
    if (expression) {
      return {
        needsTool: true,
        suggestedTool: 'calculator',
        parameters: { expression }
      }
    }
  }

  // Check for weather intent
  if (message.match(/weather|temperature|forecast|climate/)) {
    const locationMatch = message.match(/in\s+([a-z\s]+)|for\s+([a-z\s]+)|at\s+([a-z\s]+)|weather\s+([a-z\s]+)/)
    const location = locationMatch?.[1] || locationMatch?.[2] || locationMatch?.[3] || locationMatch?.[4] || 'New York'
    return {
      needsTool: true,
      suggestedTool: 'get_weather',
      parameters: { location: location.trim() }
    }
  }

  // Check for currency conversion
  if (message.match(/convert|currency|exchange|usd|eur|gbp|jpy/)) {
    const amountMatch = message.match(/(\d+\.?\d*)/)?.[1]
    const currencyMatch = message.match(/(\w{3})\s+to\s+(\w{3})|from\s+(\w{3})\s+to\s+(\w{3})/)

    if (amountMatch && currencyMatch) {
      return {
        needsTool: true,
        suggestedTool: 'currency_converter',
        parameters: {
          amount: parseFloat(amountMatch),
          from: currencyMatch[1] || currencyMatch[3] || 'USD',
          to: currencyMatch[2] || currencyMatch[4] || 'EUR'
        }
      }
    }
  }

  // Check for search intent
  if (message.match(/search|find|look up|who is|what is|when did|where is|how to/)) {
    return {
      needsTool: true,
      suggestedTool: 'web_search',
      parameters: { query: userMessage }
    }
  }

  return { needsTool: false }
}

function generateResponse(userMessage: string, toolResult?: any, toolName?: string): string {
  if (toolResult && toolName) {
    switch (toolName) {
      case 'calculator':
        return `I calculated the result: ${toolResult.expression} = ${toolResult.result}`

      case 'get_weather':
        return `The weather in ${toolResult.location} is currently ${toolResult.condition} with a temperature of ${toolResult.temperature} and humidity at ${toolResult.humidity}.`

      case 'currency_converter':
        return `Converting ${toolResult.amount} ${toolResult.from} to ${toolResult.to}: ${toolResult.result} ${toolResult.to}`

      case 'web_search':
        return `I found information about "${toolResult.query}":\n\n${toolResult.results[0].snippet}`

      default:
        return 'I executed the tool successfully.'
    }
  }

  // Default conversational responses
  const message = userMessage.toLowerCase()

  if (message.match(/hello|hi|hey|greetings/)) {
    return "Hello! I'm an agentic AI assistant. I can help you with calculations, weather information, web searches, and currency conversions. What would you like to know?"
  }

  if (message.match(/how are you|what's up/)) {
    return "I'm functioning perfectly! Ready to assist you with various tasks. What can I help you with today?"
  }

  if (message.match(/what can you do|capabilities|help/)) {
    return `I'm an agentic AI with the following capabilities:\n\n🔍 Web Search - Find current information\n🧮 Calculator - Perform mathematical calculations\n🌤️ Weather - Get weather information for any location\n💱 Currency Converter - Convert between different currencies\n\nTry asking me something like:\n- "What's the weather in Paris?"\n- "Calculate 15 * 23 + 45"\n- "Convert 100 USD to EUR"`
  }

  return "I understand your message. I can help with calculations, weather queries, web searches, and currency conversions. Could you please provide more specific details about what you'd like me to do?"
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 })
    }

    const lastMessage = messages[messages.length - 1]

    if (!lastMessage || lastMessage.role !== 'user') {
      return NextResponse.json({ error: 'Last message must be from user' }, { status: 400 })
    }

    const responseMessages = []

    // Analyze if we need to use a tool
    const intent = analyzeUserIntent(lastMessage.content)

    if (intent.needsTool && intent.suggestedTool) {
      // Execute the tool
      const toolResult = await executeTool(intent.suggestedTool, intent.parameters)

      // Add tool execution message
      responseMessages.push({
        role: 'tool',
        content: 'Tool executed',
        toolCall: intent.suggestedTool,
        toolResult
      })

      // Generate response based on tool result
      const response = generateResponse(lastMessage.content, toolResult, intent.suggestedTool)
      responseMessages.push({
        role: 'assistant',
        content: response
      })
    } else {
      // Direct response without tools
      const response = generateResponse(lastMessage.content)
      responseMessages.push({
        role: 'assistant',
        content: response
      })
    }

    return NextResponse.json({ messages: responseMessages })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
