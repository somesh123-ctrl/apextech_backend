const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Load data from JSON files
let scenarios = JSON.parse(fs.readFileSync("./data/scenarios.json"));

// Save data to JSON files
const saveData = (data, file) => {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

// Routes for scenarios
app.get("/scenarios", (req, res) => {
  res.json(scenarios);
});

app.post("/scenarios", (req, res) => {
  const newScenario = req.body;

  // Calculate the next available ID
  const nextId =
    scenarios.length > 0 ? scenarios[scenarios.length - 1].id + 1 : 1;

  // Assign the next ID to the new scenario
  newScenario.id = nextId;

  // Include an empty 'vehicles' array for the new scenario
  newScenario.vehicles = [];

  // Push the new scenario into the scenarios array
  scenarios.push(newScenario);

  // Save the updated data to the JSON file
  saveData(scenarios, "./data/scenarios.json");

  // Send the new scenario object with the assigned ID in the response
  res.json(newScenario);
});

app.put("/scenarios/:id", (req, res) => {
  const { id } = req.params;
  const updatedScenario = req.body;

  // Parse the scenario ID as an integer
  const scenarioId = parseInt(id);

  // Find the index of the scenario with the given ID
  const index = scenarios.findIndex((scenario) => scenario.id === scenarioId);

  // If the scenario is found, update it; otherwise, return an error
  if (index !== -1) {
    scenarios[index] = updatedScenario;
    saveData(scenarios, "./data/scenarios.json");
    res.json(updatedScenario);
  } else {
    res.status(404).json({ message: "Scenario not found" });
  }
});

app.delete("/scenarios/:id", (req, res) => {
  const { id } = req.params;
  const scenarioId = parseInt(id); // Ensure the id is of type number

  scenarios = scenarios.filter((scenario) => scenario.id !== scenarioId);
  saveData(scenarios, "./data/scenarios.json");
  res.json({ message: "Scenario deleted successfully" });
});

// Route for adding vehicles to a scenario
app.post("/vehicles", (req, res) => {
  const newVehicle = req.body;
  console.log(newVehicle);
  const selectedScenarioId = parseInt(newVehicle.selectedScenario); // Parse selectedScenario to integer

  // Find the scenario with the selected ID
  const selectedScenarioIndex = scenarios.findIndex(
    (scenario) => scenario.id === selectedScenarioId
  );

  if (selectedScenarioIndex !== -1) {
    // Scenario found, add the vehicle to its vehicles array
    scenarios[selectedScenarioIndex].vehicles.push(newVehicle);
    saveData(scenarios, "./data/scenarios.json");
    res.json(newVehicle);
  } else {
    res.status(404).json({ message: "Selected scenario not found" });
  }
});

app.get("/scenarios/:scenarioId/vehicles", (req, res) => {
  const { scenarioId } = req.params;
  const parsedScenarioId = parseInt(scenarioId);

  const scenario = scenarios.find(
    (scenario) => scenario.id === parsedScenarioId
  );

  if (scenario) {
    res.json(scenario.vehicles);
  } else {
    res.status(404).json({ message: "Scenario not found" });
  }
});

// Route for updating vehicles
app.put("/vehicles/:id", (req, res) => {
  const { id } = req.params;
  const updatedVehicle = req.body;

  // Find the scenario containing the vehicle
  const scenarioIndex = scenarios.findIndex((scenario) =>
    scenario.vehicles.some((vehicle) => vehicle.id === id)
  );

  if (scenarioIndex !== -1) {
    // Update the vehicle in the scenario
    const vehicleIndex = scenarios[scenarioIndex].vehicles.findIndex(
      (vehicle) => vehicle.id === id
    );
    scenarios[scenarioIndex].vehicles[vehicleIndex] = updatedVehicle;
    saveData(scenarios, "./data/scenarios.json");
    res.json(updatedVehicle);
  } else {
    res.status(404).json({ message: "Vehicle not found" });
  }
});

// Route for deleting vehicles
app.delete("/vehicles/:id", (req, res) => {
  const { id } = req.params;

  // Find the scenario containing the vehicle
  const scenarioIndex = scenarios.findIndex((scenario) =>
    scenario.vehicles.some((vehicle) => vehicle.id === id)
  );

  if (scenarioIndex !== -1) {
    // Remove the vehicle from the scenario
    scenarios[scenarioIndex].vehicles = scenarios[
      scenarioIndex
    ].vehicles.filter((vehicle) => vehicle.id !== id);
    saveData(scenarios, "./data/scenarios.json");
    res.json({ message: "Vehicle deleted successfully" });
  } else {
    res.status(404).json({ message: "Vehicle not found" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
