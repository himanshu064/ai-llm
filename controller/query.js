const path = require("path");
const fs = require("fs");
const { trainModel, makePrediction } = require("../function");

exports.train = async (req, res) => {
  try {
    // Path to your training data
    const dataPath = path.join(__dirname, "../data.csv");
    // Train the model
    let result = await trainModel(dataPath).catch(console.error);
    console.log({result});
    res.status(200).json({ message: "Model trained successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.predict = async (req, res) => {
    let {query} = req.query
  try {
    const testQuestion = query;
    const answer = await makePrediction(testQuestion);
    console.log(`Question: "${testQuestion}" - Answer: "${answer}"`);
    res.status(200).json({ answer });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateCSVFile = async (req, res) => {
    try {

        let data = req.body.data.split("\n").map((line) => line.split(","));
        const dataPath = path.join(__dirname, "../data.csv");
        console.log({data});
        data = data.map((row, i) => row.length < 2 ? undefined : row);
        data = data.filter((row) => row);
        console.log({data});

        const csv = data.map((row) => `"${row[0]}","${row[1]}"`).join("\n");
        console.log({csv});
        fs.appendFile(dataPath,"\n"+ csv, (err) => {
            if (err) throw err;
            console.log('Data appended to file');
          });
       // fs.writeFileSync(dataPath, csv);
        res.status(200).json({ message: "Data updated successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}