const tf = require("@tensorflow/tfjs-node");
const use = require("@tensorflow-models/universal-sentence-encoder");
const fs = require("fs");
const path = require("path");

async function loadData(dataPath) {
  const data = fs
    .readFileSync(dataPath, "utf8")
    .split("\n")
    .slice(1)
    .map((line) => line.split(","));
  const questions = data.map((row) => row[0].replace(/"/g, ""));
  const answers = data.map((row) => row[1].replace(/"/g, ""));
  return { questions, answers };
}

// Encode the texts using Universal Sentence Encoder
async function encodeTexts(texts) {
  const model = await use.load();
  const embeddings = await model.embed(texts);
  return embeddings;
}

// Build and train the model
async function trainModel(dataPath) {
  const { questions, answers } = await loadData(dataPath);
  const questionEmbeddings = await encodeTexts(questions);
  const answerEmbeddings = await encodeTexts(answers);

  // Define the model architecture
  const model = tf.sequential();
  model.add(
    tf.layers.dense({
      inputShape: [questionEmbeddings.shape[1]],
      units: 128,
      activation: "relu",
    })
  );
  model.add(tf.layers.dense({ units: answerEmbeddings.shape[1] }));

  model.compile({
    optimizer: tf.train.adam(),
    loss: "meanSquaredError",
    metrics: ["accuracy"],
  });

  // Train the model
  await model.fit(questionEmbeddings, answerEmbeddings, {
    epochs: 50,
    batchSize: 32,
    validationSplit: 0.2,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log(
          `Epoch ${epoch + 1}: loss = ${logs.loss}, accuracy = ${logs.acc}`
        );
      },
    },
  });

  console.log("Model trained successfully");
  await model.save("file://./model");
  return true;
}

// Function to preprocess the input text
async function preprocessText(text) {
  const model = await use.load();
  const embeddings = await model.embed([text]);
  return embeddings;
}

// Function to load the trained model
async function loadModel() {
  const model = await tf.loadLayersModel("file://./model/model.json");
  return model;
}

// Function to make a prediction
async function makePrediction(text) {
  const model = await loadModel();
  const questionEmbedding = await preprocessText(text);

  const answerEmbedding = model.predict(questionEmbedding);
  const answerText = await findClosestAnswer(answerEmbedding);

  return answerText;
}

// Function to find the closest answer based on the embedding
async function findClosestAnswer(embedding) {
  const { answers } = await loadData(path.join(__dirname, "data.csv"));
  const answerEmbeddings = await encodeTexts(answers);

  const distances = answerEmbeddings.sub(embedding).square().sum(1);
  const minIndex = distances.argMin().dataSync()[0];

  return answers[minIndex];
}

// Load and preprocess the dataset
async function loadData(dataPath) {
  const data = fs
    .readFileSync(dataPath, "utf8")
    .split("\n")
    .slice(1)
    .map((line) => line.split(","));
  const questions = data.map((row) => row[0].replace(/"/g, ""));
  const answers = data.map((row) => row[1].replace(/"/g, ""));
  return { questions, answers };
}

// Encode the texts using Universal Sentence Encoder
async function encodeTexts(texts) {
  const model = await use.load();
  const embeddings = await model.embed(texts);
  return embeddings;
}

module.exports = { trainModel, makePrediction };
