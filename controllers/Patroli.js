// controllers/PatroliController.js
import PatroliModel from "../models/PatroliModel.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { Op, literal } from 'sequelize';

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
    "temuan",
    `${day}-${month}-${year}`
  );

  if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath, { recursive: true });
  }

  return storagePath;
};

let lastResetDay;

try {
  lastResetDay =
    parseInt(fs.readFileSync("lastResetDay.txt", "utf8")) ||
    new Date().getDate();
} catch (err) {
  lastResetDay = new Date().getDate();
  fs.writeFileSync("lastResetDay.txt", lastResetDay.toString(), "utf8");
}

let uploadedFilesCount = 0;

const resetFileCounter = () => {
  const currentDay = new Date().getDate();
  if (currentDay !== lastResetDay) {
    uploadedFilesCount = 1;
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
    const patroliId = req.params.id;
    const now = new Date();
    const formattedDate = `${now.getDate()}-${
      now.getMonth() + 1
    }-${now.getFullYear()}`;
    uploadedFilesCount++;
    const fileName =
      uploadedFilesCount === 1 ? "foto1" : `foto${uploadedFilesCount}`;

    cb(
      null,
      `temuan_${fileName}_${formattedDate}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({ storage: storage });

export const uploadPhotoPatroli = upload.fields([
  { name: "photo1" },
  { name: "photo2" },
]);

export const createPatroli = async (req, res) => {
  try {
    const { tanggal, lokasi, urai_temuan, tindak, status } = req.body;

    if (!req.files || !req.files["photo1"] || !req.files["photo2"]) {
      return res.status(400).json({ msg: "Photo files are required" });
    }

    resetFileCounter();

    const newPatroli = Patroli.build({
      tanggal,
      lokasi,
      urai_temuan,
      tindak,
      status,
    });

    const photo1Path = req.files["photo1"][0].filename;
    const photo2Path = req.files["photo2"][0].filename;

    const storagePath = getStoragePath();

    newPatroli.url1 = `/image/temuan/${photo1Path}`;
    newPatroli.url2 = `/image/temuan/${photo2Path}`;

    await newPatroli.save();

    res
      .status(201)
      .json({ id: newPatroli.id, msg: "Data patroli berhasil dibuat" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Lokasi dan Temuan harus diisi" });
  }
};

export const updatePatroli = async (req, res) => {
  try {
    const { id } = req.params;
    const { tanggal, lokasi, urai_temuan, tindak, status } = req.body;

    const patroliToUpdate = await Patroli.findByPk(id);

    if (!patroliToUpdate) {
      return res.status(404).json({ msg: "Record tidak ditemukan" });
    }

    patroliToUpdate.tanggal = tanggal;
    patroliToUpdate.lokasi = lokasi;
    patroliToUpdate.urai_temuan = urai_temuan;
    patroliToUpdate.tindak = tindak;
    patroliToUpdate.status = status;

    if (req.files) {
      const photo1Path = req.files["photo1"][0].filename;
      const photo2Path = req.files["photo2"][0].filename;

      const storagePath = getStoragePath();

      patroliToUpdate.photo1Url = `/image/temuan/${photo1Path}`;
      patroliToUpdate.photo2Url = `/image/temuan/${photo2Path}`;
    }

    await patroliToUpdate.save();

    res.json({ msg: "Data patroli berhasil diperbarui" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error" });
  }
};

export const getPatroli = async (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search_query || "";
  const offset = limit * page;
  const startDate = req.query.startDate || "";
  const endDate = req.query.endDate || "";

  const dateFilter = startDate && endDate ? {
      tanggal: {
          [Op.between]: [startDate, endDate]
      }
  } : {};

  const totalRows = await PatroliModel.count({
      where: {
          [Op.or]: [
              { tanggal: { [Op.like]: '%' + search + '%' } },
              { lokasi: { [Op.like]: '%' + search + '%' } },
              { urai_temuan: { [Op.like]: '%' + search + '%' } },
              { tindak: { [Op.like]: '%' + search + '%' } },
              { status: { [Op.like]: '%' + search + '%' } },
          ]
      }
  });

  const totalPage = Math.ceil(totalRows / limit);

  const result = await PatroliModel.findAll({
      attributes: [
          'id',
          [literal("DATE_FORMAT(tanggal, '%d %m %Y')"), 'formattedTanggal'],
          'lokasi',
          'urai_temuan',
          'url1',
          'url2',
          'tindak',
          'status'
      ],
      where: {
          [Op.and]: [
              dateFilter,
              {
                  [Op.or]: [
                      { tanggal: { [Op.like]: '%' + search + '%' } },
                      { lokasi: { [Op.like]: '%' + search + '%' } },
                      { urai_temuan: { [Op.like]: '%' + search + '%' } },
                      { tindak: { [Op.like]: '%' + search + '%' } },
                      { status: { [Op.like]: '%' + search + '%' } },
                  ]
              },
          ],
      },
      offset: offset,
      limit: limit,
      order: [
          ['id', 'DESC']
      ]
  });

  res.json({
      result: result,
      page: page,
      limit: limit,
      totalRows: totalRows,
      totalPage: totalPage
  });
};

export const getPatroliById = async (req, res) => {
  try {
    const response = await PatroliModel.findOne({
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

export const savePatroli = (req, res) => {
  if (req.files === null) {
    return res.status(400).json({ msg: "No File Uploaded" });
  }

  const { tanggal, urai_temuan } = req.body;
  const file = req.files.file;
  const fileSize = file.data.length;
  const ext = path.extname(file.name);
  const fileName = file.md5 + ext;
  const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
  const allowedType = [".png", ".jpg", ".jpeg"];

  if (!allowedType.includes(ext.toLowerCase())) {
    return res.status(422).json({ msg: "Invalid Images" });
  }

  if (fileSize > 5000000) {
    return res.status(422).json({ msg: "Image must be less than 5 MB" });
  }

  file.mv(`./public/images/${fileName}`, async (err) => {
    if (err) {
      return res.status(500).json({ msg: err.message });
    }

    try {
      await Patroli.create({ tanggal, urai_temuan, image: fileName, url });
      res.status(201).json({ msg: "Patroli Created Successfully" });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ msg: "Internal Server Error" });
    }
  });
};

export const deletePatroli = async (req, res) => {
  try {
    const patroli = await PatroliModel.findOne({
      where: {
        id: req.params.id,
      },
    });

    if (!patroli) {
      return res.status(404).json({ msg: "No Data Found" });
    }

    const imagePath = patroli.url1;
    const filepath = `./public/images/${imagePath}`;

    // Pengecekan apakah file dengan path tersebut ada
    if (imagePath && fs.existsSync(filepath)) {
      try {
        fs.unlinkSync(filepath);
      } catch (error) {
        console.log(error.message);
        return res.status(500).json({ msg: "Error deleting file" });
      }
    }

    try {
      await PatroliModel.destroy({
        where: {
          id: req.params.id,
        },
      });
      console.log(`Data with id ${req.params.id} deleted successfully.`);
      return res.status(200).json({ msg: "Patroli Deleted Successfully" });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ msg: "Error deleting Patroli data" });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};