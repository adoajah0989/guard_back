import multer from "multer";
import path from "path";
import fs from "fs";
import Lapdi from "../models/LapdiModel.js";
import {Op, literal} from "sequelize";

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const getStoragePath = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const storagePath = path.resolve('public', 'image', 'lapdi', `${day}-${month}-${year}`);

  if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath, { recursive: true });
  }

  return storagePath;
};

let fileCounter = 1;
let lastResetDay;

try {
  const data = fs.readFileSync('lastResetDay.txt', 'utf8');
  lastResetDay = parseInt(data);
} catch (err) {
  lastResetDay = new Date().getDate();
}

const resetFileCounter = () => {
  const now = new Date();
  const currentDay = now.getDate();
  if (currentDay !== lastResetDay) {
    fileCounter = 1;
    lastResetDay = currentDay;

    fs.writeFileSync('lastResetDay.txt', currentDay.toString(), 'utf8');
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
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const fileNumber = fileCounter++;
    const formattedDate = `${day}-${month}-${year}`;
    const customFileName = `lapdi_foto${fileNumber}_${formattedDate}${path.extname(file.originalname)}`;
    cb(null, customFileName);
  },
});

const upload = multer({ storage: storage });
export const uploadLapdi= upload.single('bukti1');

export const createLapdi = async (req, res) => {
  try {
    console.log(req.files);
    const storagePath = getStoragePath();
    const tanggal = req.body.tanggal;
    const jam = req.body.jam;
    const anggota = req.body.anggota;
    const urai = req.body.urai;
    const lokasi = req.body.lokasi;
    const penyebab = req.body.penyebab;
    const kerugian = req.body.kerugian;
    const tindakan = req.body.tindakan;
    console.log(req.file);
const photo1Path = req.file.filename;

    const newPhotoTest = await Lapdi.create({
      tanggal : tanggal,
      jam : jam,
      anggota : anggota,
      urai : urai,
      lokasi : lokasi,
      penyebab : penyebab,
      kerugian : kerugian,
      tindakan : tindakan,
      image: `/image/${storagePath}/${photo1Path}`,
    });

    res.json({ success: true, message: 'Sukses Upload', newPhotoTest });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getLapdiById = async (req, res) => {
  try {
    const response = await Lapdi.findOne({
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

export const getLapdi = async (req, res) => {
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

  const totalRows = await Lapdi.count({
    where: {
      [Op.or]: [
        { tanggal: { [Op.like]: '%' + search + '%' } },
        { jam: { [Op.like]: '%' + search + '%' } },
        { anggota: { [Op.like]: '%' + search + '%' } },
        { urai: { [Op.like]: '%' + search + '%' } },
        { lokasi: { [Op.like]: '%' + search + '%' } },
        { penyebab: { [Op.like]: '%' + search + '%' } },
        { kerugian: { [Op.like]: '%' + search + '%' } },
        { tindakan: { [Op.like]: '%' + search + '%' } },
      ],
      ...dateFilter
    }
  });

  const totalPage = Math.ceil(totalRows / limit);

  const result = await Lapdi.findAll({
    attributes: [
      'id',
      [literal("DATE_FORMAT(tanggal, '%d %m %Y')"), 'formattedTanggal'],
      'jam',
      'anggota',
      'urai',
      'lokasi',
      'penyebab',
      'kerugian',
      'tindakan',
      'image'
    ],
    where: {
      [Op.and]: [
        dateFilter,
        {
          [Op.or]: [
            { tanggal: { [Op.like]: '%' + search + '%' } },
            { jam: { [Op.like]: '%' + search + '%' } },
            { anggota: { [Op.like]: '%' + search + '%' } },
            { urai: { [Op.like]: '%' + search + '%' } },
            { lokasi: { [Op.like]: '%' + search + '%' } },
            { penyebab: { [Op.like]: '%' + search + '%' } },
            { kerugian: { [Op.like]: '%' + search + '%' } },
            { tindakan: { [Op.like]: '%' + search + '%' } },
          ]
        }
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
}

export const deleteLapdi = async (req, res) => {
  try {
    const lapdiId = req.params.id;

    // Hapus Lapdi dari database berdasarkan ID
    await Lapdi.destroy({
      where: {
        id: lapdiId,
      },
    });

    res.status(200).json({ msg: "Lapdi deleted successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};
