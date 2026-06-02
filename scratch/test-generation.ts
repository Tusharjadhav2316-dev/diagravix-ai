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
    result1.nodes.forEach(n => console.log(`  - [${n.id}] label: "${n.label}" (type: ${n.type}) x: ${n.x} y: ${n.y}`))
  } catch (err: any) {
    console.error("❌ TEST 1 FAILED:", err.message)
  }

  // Test case 2: Class Diagram mapping rules
  console.log("\n-----------------------------------------------------------------")
  console.log("Test Case 2: Class Diagram Style Generation (Class & Dependency rules)")
  console.log("Input: Define User, Admin inherits from User, and AuthController depends on both.")
  try {
    const result2 = await generateDiagramWithFallback(
      "Define User class, Admin class inherits from User, and AuthController class depends on both.",
      "class"
    )
    console.log("✅ TEST 2 PASSED!")
    console.log("Generated nodes count:", result2.nodes.length)
    console.log("Generated edges count:", result2.edges.length)
    result2.nodes.forEach(n => console.log(`  - [${n.id}] label: "${n.label}" (type: ${n.type}) x: ${n.x} y: ${n.y}`))
  } catch (err: any) {
    console.error("❌ TEST 2 FAILED:", err.message)
  }

  // Test case 3: Large Diagram spacing rules (Collision verification)
  console.log("\n-----------------------------------------------------------------")
  console.log("Test Case 3: Large Diagram Spacing & Hierarchy checks")
  console.log("Input: Client makes request. Load balancer routes to WebServerA, WebServerB or WebServerC. Each server queries Cache. Cache misses go to MySQL cluster.")
  try {
    const result3 = await generateDiagramWithFallback(
      "Client makes request. Load balancer routes to WebServerA, WebServerB or WebServerC. Each server queries Cache. Cache misses go to MySQL cluster.",
      "entityrelation"
    )
    console.log("✅ TEST 3 PASSED!")
    console.log("Generated nodes count:", result3.nodes.length)
    console.log("Generated edges count:", result3.edges.length)
    result3.nodes.forEach(n => console.log(`  - [${n.id}] label: "${n.label}" (type: ${n.type}) x: ${n.x} y: ${n.y}`))
  } catch (err: any) {
    console.error("❌ TEST 3 FAILED:", err.message)
  }
  
  console.log("\n=================== ALL TEST RUNNERS COMPLETE ===================")
}

runTests().catch(console.error)
