// controllers/PatroliController.js
import ExpedisiModel from "../models/ExpedisiModel.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { Op, literal } from "sequelize";

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const getStoragePath = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const storagePath = path.resolve(
    "public",
    "image",
    "namaDok",
    `${day}-${month}-${year}`
  );

  if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath, { recursive: true });
  }

  return storagePath;
};

let fileCounter = 1;
let lastResetDay;

try {
  const data = fs.readFileSync("lastResetDay.txt", "utf8");
  lastResetDay = parseInt(data);
} catch (err) {
  lastResetDay = new Date().getDate();
}

let uploadedFilesCount = 0;

const resetFileCounter = () => {
  const now = new Date();
  const currentDay = now.getDate();
  if (currentDay !== lastResetDay) {
    fileCounter = 1;
    lastResetDay = currentDay;

    fs.writeFileSync("lastResetDay.txt", currentDay.toString(), "utf8");
  }
};
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    resetFileCounter();
    cb(null, getStoragePath());
  },
  filename: function (req, file, cb) {
    resetFileCounter();
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const fileNumber = fileCounter++;
    const formattedDate = `${day}-${month}-${year}`;
    const customFileName = `ekspedisi_foto${fileNumber}_${formattedDate}${path.extname(
      file.originalname
    )}`;
    cb(null, customFileName);
  },
});

const upload = multer({ storage: storage });

export const uploadEkspedisi = upload.single("bukti1");


export const createEkspedisi = async (req, res) => {
  try {
    const storagePath = getStoragePath();
    const { tanggal, dokumen, dari, untuk, diterima } = req.body;
    const photo1Path = req.file.filename;

    const newEkspedisi = await Ekspedisi.create({
      tanggal: tanggal,
      dokumen: dokumen,
      dari: dari,
      untuk: untuk,
      diterima: diterima,
      image: `/image/ekspedisi/${photo1Path}`,
    });

    res
      .status(201)
      .json({ id: newEkspedisi.id, msg: "Data ekspedisi berhasil dibuat" });
  } catch (error) {
    console.error("Create Ekspedisi error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const updateEkspedisi = async (req, res) => {
  try {
    const { id } = req.params;
    const { diterima } = req.body;

    const ekspedisiToUpdate = await Ekspedisi.findByPk(id);

    if (!ekspedisiToUpdate) {
      return res.status(404).json({ msg: "Record tidak ditemukan" });
    }

    ekspedisiToUpdate.diterima = diterima;

    await ekspedisiToUpdate.save();

    res.json({ msg: "Data Ekspedisi berhasil diperbarui" });
  } catch (error) {
    console.error("Update Ekspedisi error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};


//jangan sentuh code yang dibawah sini #ADO

export const getExpedisi = async (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search_query || "";
  const offset = limit * page;
  const startDate = req.query.startDate || "";
  const endDate = req.query.endDate || "";

  const dateFilter =
    startDate && endDate
      ? {
          tanggal: {
            [Op.between]: [startDate, endDate],
          },
        }
      : {};

  const totalRows = await ExpedisiModel.count({
    where: {
      [Op.or]: [
        { tanggal: { [Op.like]: "%" + search + "%" } },
        { namaDok: { [Op.like]: "%" + search + "%" } },
        { dari: { [Op.like]: "%" + search + "%" } },
        { untuk: { [Op.like]: "%" + search + "%" } },
        { diserahkan: { [Op.like]: "%" + search + "%" } },
      ],
    },
  });

  const totalPage = Math.ceil(totalRows / limit);

  const result = await ExpedisiModel.findAll({
    attributes: [
      "id",
      [literal("DATE_FORMAT(tanggal, '%d %m %Y')"), "formattedTanggal"],
      "namaDok",
      "dari",
      "url1",
      "untuk",
      "diserahkan",
    ],
    where: {
      [Op.and]: [
        dateFilter,
        {
          [Op.or]: [
            { tanggal: { [Op.like]: "%" + search + "%" } },
            { namaDok: { [Op.like]: "%" + search + "%" } },
            { dari: { [Op.like]: "%" + search + "%" } },
            { untuk: { [Op.like]: "%" + search + "%" } },
            { diserahkan: { [Op.like]: "%" + search + "%" } },
          ],
        },
      ],
    },
    offset: offset,
    limit: limit,
    order: [["id", "DESC"]],
  });

  res.json({
    result: result,
    page: page,
    limit: limit,
    totalRows: totalRows,
    totalPage: totalPage,
  });
};

export const getExpedisiById = async (req, res) => {
  try {
    const response = await ExpedisiModel.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!response) {
      return res.status(404).json({ msg: "No Data Found" });
    }
    res.json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

export const deleteExpedisi = async (req, res) => {
  const expedisi = await ExpedisiModel.findOne({
    where: {
      id: req.params.id,
    },
  });

  if (!expedisi) {
    return res.status(404).json({ msg: "No Data Found" });
  }

  try {
    const imagePath = expedisi.url1;

    if (!imagePath) {
      return res.status(400).json({ msg: "Image path is undefined" });
    }

    const filepath = `./public/images/${imagePath}`;

    // Pengecekan apakah file dengan path tersebut ada
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);

      await ExpedisiModel.destroy({
        where: {
          id: req.params.id,
        },
      });

      res.status(200).json({ msg: "Expedisi Deleted Successfully" });
    } else {
      res.status(404).json({ msg: "File not found" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};
