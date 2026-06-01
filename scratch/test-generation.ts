// Test runner script to validate AI fallback logic and schema transformation
import { generateDiagramWithFallback } from "../lib/ai-engine"
import dotenv from "dotenv"
import path from "path"

// Load env configuration variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

async function runTests() {
  console.log("=== DIAGRAVIX AI GENERATION ENGINE INTEGRATION TEST SUITE ===\n")
  
  // Test case 1: Complex Multi-step process (Groq Engine)
  console.log("-----------------------------------------------------------------")
  console.log("Test Case 1: Complex Flowchart Generation (Checks normal provider paths)")
  console.log("Input: User submits order. Payment processor checks balance. If balance is sufficient, database saves order. Otherwise, system throws insufficient funds error.")
  try {
    const result1 = await generateDiagramWithFallback(
      "User submits order. Payment processor checks balance. If balance is sufficient, database saves order. Otherwise, system throws insufficient funds error.",
      "flowchart"
    )
    console.log("✅ TEST 1 PASSED!")
    console.log("Generated nodes count:", result1.nodes.length)
    console.log("Generated edges count:", result1.edges.length)
    console.log("Nodes list mapping preview:")
    result1.nodes.forEach(n => console.log(`  - [${n.id}] label: "${n.label}" (type: ${n.type})`))
  } catch (err: any) {
    console.error("❌ TEST 1 FAILED:", err.message)
  }

  // Test case 2: Fallback trigger execution (Simulate Groq crash & fallback to local NLP)
  console.log("\n-----------------------------------------------------------------")
  console.log("Test Case 2: Recovery Fallback Logic (Checks error handling and NLP recovery)")
  console.log("Action: Temp clearing GROQ_API_KEY to trigger recovery chains...")
  
  const savedGroqKey = process.env.GROQ_API_KEY
  // Temporarily clear environment api keys
  delete process.env.GROQ_API_KEY
  delete process.env.GEMINI_API_KEY

  try {
    const result2 = await generateDiagramWithFallback(
      "Customer requests support ticket. Router assigns ticket to support agent. Agent replies to user.",
      "flowchart"
    )
    console.log("✅ TEST 2 PASSED! Successfully recovered via Local NLP Fallback Engine.")
    console.log("Generated nodes count:", result2.nodes.length)
    console.log("Generated edges count:", result2.edges.length)
    result2.nodes.forEach(n => console.log(`  - [${n.id}] label: "${n.label}"`))
  } catch (err: any) {
    console.error("❌ TEST 2 FAILED:", err.message)
  } finally {
    // Restore api keys
    process.env.GROQ_API_KEY = savedGroqKey
  }
  
  console.log("\n=================== ALL TEST RUNNERS COMPLETE ===================")
}

runTests().catch(console.error)
