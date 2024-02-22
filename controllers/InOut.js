import multer from 'multer';
import path from 'path';
import fs from 'fs';
import InOut from '../models/InOutModel.js';
import { Op, literal } from 'sequelize';
import moment from 'moment';

const getStoragePath = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const storagePath = path.resolve('public', 'image', 'In-Out', `${day}-${month}-${year}`);

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
    const temporaryFileName = `inout_foto_temp_${fileNumber}_${formattedDate}${path.extname(file.originalname)}`;
    cb(null, temporaryFileName);
  },
});

export const uploadInOut = multer({ storage: storage }).single('bukti1');

export const createInOut = async (req, res) => {
  try {
    console.log('Request Body:', req.body);
      const storagePath = getStoragePath();
      const { no_kendaraan, time_in, name } = req.body;
      const photo1Path = req.file.filename;

      const newInout = await InOut.create({
          no_kendaraan: no_kendaraan,
          time_in: time_in,
          image: `/image/inout/${photo1Path}`,
          users: name
      });
      console.log(`User ${name} membuat In-Out baru`);
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const fileNumber = fileCounter++;
      const formattedDate = `${day}-${month}-${year}`;
      const finalFileName = `inout_foto_${no_kendaraan}_${fileNumber}_${formattedDate}${path.extname(photo1Path)}`;
      
      fs.renameSync(path.join(storagePath, req.file.filename), path.join(storagePath, finalFileName));

      res.status(201).json({ id: newInout.id, msg: "Data ekspedisi berhasil dibuat" });
  } catch (error) {
      console.error('Create Ekspedisi error:', error);
      res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updateInOut = async (req, res) => {
  try {
    const { id } = req.params;
    const { time_out } = req.body;
    const { no_kendaraan} = req.body;
    const inoutToUpdate = await InOut.findByPk(id);

    if (!inoutToUpdate) {
      return res.status(404).json({ msg: "Record tidak ditemukan" });
    }

    inoutToUpdate.time_out = time_out;
    inoutToUpdate.no_kendaraan = no_kendaraan;
    await inoutToUpdate.save();

    res.json({ msg: "Data In-Out berhasil diperbarui" });
  } catch (error) {
    console.error('Update In-Out error:', error);
    res.status(500).json({ msg: "Server Error" });
  }
};
  
export const updateInOutBawah = async (req, res) => {
  try {
    const { id } = req.params;
    const { time_out } = req.body;
    const inoutToUpdate = await InOut.findByPk(id);

    if (!inoutToUpdate) {
      return res.status(404).json({ msg: "Record tidak ditemukan" });
    }

    inoutToUpdate.time_out = time_out;
    await inoutToUpdate.save();

    res.json({ msg: "Data In-Out berhasil diperbarui" });
  } catch (error) {
    console.error('Update In-Out error:', error);
    res.status(500).json({ msg: "Server Error" });
  }
};

export const deleteInOut = async (req, res) => {
  try {
    const { id } = req.params;
    const inoutToDelete = await InOut.findByPk(id);

    if (!inoutToDelete) {
      return res.status(404).json({ msg: "Record tidak ditemukan" });
    }
    const imagePath = path.resolve('public', 'image', 'in-out', inoutToDelete.image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    await inoutToDelete.destroy();
    res.json({ msg: "Data In-Out berhasil dihapus" });
  } catch (error) {
    console.error('Delete In-Out error:', error);
    res.status(500).json({ msg: "Server Error" });
  }
};
  
  export const getinOut = async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search_query || "";
    const offset = limit * page;
    const startDate = req.query.startDate || "";
    const endDate = req.query.endDate || "";
  
    const dateFilter = startDate && endDate ? {
        time_in: {
            [Op.between]: [startDate, endDate]
        }
    } : {};
  
    const totalRows = await InOut.count({
        where: {
            [Op.or]: [
                { no_kendaraan: { [Op.like]: '%' + search + '%' } },
                { time_in: { [Op.like]: '%' + search + '%' } },
                { time_out: { [Op.like]: '%' + search + '%' } },
            ]
        }
    });
  
    const totalPage = Math.ceil(totalRows / limit);
  
    const result = await InOut.findAll({
        attributes: [
            'id',
            'time_in',
            'no_kendaraan',
            'time_out',
            'image'
        ],
        where: {
            [Op.and]: [
                dateFilter,
                {
                    [Op.or]: [
                        { no_kendaraan: { [Op.like]: '%' + search + '%' } },
                        { time_in: { [Op.like]: '%' + search + '%' } },
                        { time_out: { [Op.like]: '%' + search + '%' } },
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
  
  export const getinOutById = async (req, res) => {
    try {
      const response = await InOut.findOne({
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