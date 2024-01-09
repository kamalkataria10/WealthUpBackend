import express from "express";
import mongoose from "mongoose";

// create code and check code

// app config
const app = express();
const port = process.env.PORT || 3001;

// middleware
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"),
    res.setHeader("Access-Control-Allow-Headers", "*"),
    next();
});

// DB config
mongoose.connect("mongodb+srv://kamal:kamal123@dytetest.3wpkb8s.mongodb.net/", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// api routes
app.get("/", (req, res) => res.status(200).send({ message: "Hello World" }));

function generateCode(length) {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }
  return code;
}

const codeSchema = new mongoose.Schema(
  {
    code: String,
  },
  {
    timestamps: true,
  }
);

app.get("/getCode", (req, res) => {
  const CodeModel = mongoose.model("Code", codeSchema);
  let code = generateCode(6);
  CodeModel.findOne({ code: code }).then(async (err, existingCode) => {
    if (err) {
      console.error(err);
      res.status(err.code).send({ message: err.message });
    }
    if (existingCode) {
      code = generateCode(6);
    }
    const newCode = new CodeModel({ code: code });
    const gcode = await newCode.save();
    console.log("New code created:", gcode);
    res.status(201).send({ code: gcode.code });
  });
});

app.post("/checkCode", (req, res) => {
  const code = req.body.code;
  const CodeModel = mongoose.model("Code", codeSchema);

  const checkCodeValidity = async (code) => {
    try {
      const existingCode = await CodeModel.findOne({ code });

      if (existingCode) {
        const currentTime = new Date();
        const codeTime = existingCode.createdAt;
        const timeDifferenceInMinutes = Math.floor(
          (currentTime - codeTime) / (1000 * 60)
        );

        if (timeDifferenceInMinutes >= 10) {
          console.log("Code is expired:", code);
          res.status(201).send({ message: "Code is expired" });
        } else {
          console.log("Valid code:", code);
          res.status(200).send({ message: "Valid code" });
        }
      } else {
        console.log("Code is invalid:", code);
        res.status(202).send({ message: "Code is invalid" });
      }
    } catch (error) {
      console.error("Error checking code validity:", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  };

  // Usage
  checkCodeValidity(code);
});

// listen
app.listen(port, () => {
  console.log("Server is running at port 3001");
});
