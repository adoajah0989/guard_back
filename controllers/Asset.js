import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';
import Photo from '../models/AssetModel.js';
import { Op, literal } from 'sequelize';

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const getStoragePath = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const storagePath = path.resolve('public', 'image', 'asset', `${day}-${month}-${year}`);

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
    const customFileName = `asset_foto${fileNumber}_${formattedDate}${path.extname(file.originalname)}`;
    cb(null, customFileName);
  },
});

const upload = multer({ storage: storage });

export const uploadPhotos = upload.fields([{ name: 'photo1' }, { name: 'photo2' }]);

export const handleUpload = async (req, res) => {
  try {
    const storagePath = getStoragePath();
    const photo1Path = req.files['photo1'][0].filename;
    const photo2Path = req.files['photo2'][0].filename;
    const catatan = req.body.catatan;
    const lokasi = req.body.lokasi;
    const timestamp = req.body.timestamp;

    const newPhotoTest = await Photo.create({
      url1: `/image/${storagePath}/${photo1Path}`,
      url2: `/image/${storagePath}/${photo2Path}`,
      catatan: catatan,
      lokasi: lokasi,
      timestamp: timestamp
    });

    res.json({ success: true, message: 'Sukses Upload', newPhotoTest });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


export const createAsset = async (req, res) => {
  try {
    const { lokasi, timestamp, catatan } = req.body;

    if (!req.files || !req.files["photo1"] || !req.files["photo2"]) {
      return res.status(400).json({ msg: "Photo files are required" });
    }

    resetFileCounter();

    const newAsset = Asset.build({
      lokasi,
      timestamp,
      catatan,
    });

    const photo1Path = req.files["photo1"][0].filename;
    const photo2Path = req.files["photo2"][0].filename;

    const storagePath = getStoragePath();

    newAsset.url1 = `/image/asset/${photo1Path}`;
    newAsset.url2 = `/image/asset/${photo2Path}`;

    await newAsset.save();

    res
      .status(201)
      .json({ id: newAsset.id, msg: "Data asset berhasil dibuat" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Lokasi harus diisi" });
  }
};

export const updateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const { lokasi, timestamp, catatan,  } = req.body;

    const assetToUpdate = await Asset.findByPk(id);

    if (!assetToUpdate) {
      return res.status(404).json({ msg: "Record tidak ditemukan" });
    }

    assetToUpdate.lokasi = lokasi;
    assetToUpdate.timestamp = timestamp;
    assetToUpdate.catatan = catatan;


    if (req.files) {
      const photo1Path = req.files["photo1"][0].filename;
      const photo2Path = req.files["photo2"][0].filename;

      const storagePath = getStoragePath();

      assetToUpdate.photo1Url = `/image/asset/${photo1Path}`;
      assetToUpdate.photo2Url = `/image/asset/${photo2Path}`;
    }

    await assetToUpdate.save();

    res.json({ msg: "Data patroli berhasil diperbarui" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error" });
  }
};

export const getAssetQ = async (req, res) => {
  try {
    const result = await Photo.findAll();
    
    if (result.length === 0) {
      // Jika tidak ada data ditemukan
      res.status(404).json({ message: 'Data not found' });
    } else {
      // Jika data ditemukan
      res.status(200).json(result);
    }
  } catch (error) {
    console.error('Error in getAssetQ:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
export const getAsset = async (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search_query || "";
  const offset = limit * page;
  const startDate = req.query.startDate || "";
  const endDate = req.query.endDate || "";

  const dateFilter = startDate && endDate ? {
      timestamp: {
          [Op.between]: [startDate, endDate]
      }
  } : {};

  const totalRows = await Photo.count({
      where: {
          [Op.or]: [
              { lokasi: { [Op.like]: '%' + search + '%' } },
              { timestamp: { [Op.like]: '%' + search + '%' } },
              { catatan: { [Op.like]: '%' + search + '%' } },
          ]
      }
  });

  const totalPage = Math.ceil(totalRows / limit);

  const result = await Photo.findAll({
      attributes: [
          'id',
          [literal("DATE_FORMAT(Timestamp, '%d %m %Y')"), 'formattedTimestamp'],
          'lokasi',
          'timestamp',
          'url1',
          'url2',
          'catatan',
      ],
      where: {
          [Op.and]: [
              dateFilter,
              {
                  [Op.or]: [
                      { lokasi: { [Op.like]: '%' + search + '%' } },
                      { timestamp: { [Op.like]: '%' + search + '%' } },
                      { catatan: { [Op.like]: '%' + search + '%' } },
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

export const getAssetById = async (req, res) => {
  try {
    const response = await Photo.findOne({
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

export const saveAsset = (req, res) => {
  if (req.files === null) {
    return res.status(400).json({ msg: "No File Uploaded" });
  }

  const { timestamp, lokasi } = req.body;
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
      await Asset.create({ timestamp, lokasi, image: fileName, url });
      res.status(201).json({ msg: "Asset Created Successfully" });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ msg: "Internal Server Error" });
    }
  });
};

export const deleteAsset = async (req, res) => {
  try {
    const asset = await Photo.findByPk(req.params.id);

    if (!asset) {
      return res.status(404).json({ msg: "No Data Found" });
    }

    const imagePath1 = asset.url1;
    const imagePath2 = asset.url2;

    // Pengecekan apakah file dengan path tersebut ada
    if (fs.existsSync(imagePath1)) {
      // Pindahkan file ke folder sampah
      const trashFolder = path.resolve(__dirname, '../public/trash');
      if (!fs.existsSync(trashFolder)) {
        fs.mkdirSync(trashFolder);
      }

      const trashImagePath1 = path.join(trashFolder, path.basename(imagePath1));
      
      // Gunakan fs-extra untuk memastikan pemindahan yang andal
      await fs.move(imagePath1, trashImagePath1);
    }

    if (fs.existsSync(imagePath2)) {
      // Pindahkan file ke folder sampah
      const trashFolder = path.resolve(__dirname, '../public/trash');
      if (!fs.existsSync(trashFolder)) {
        fs.mkdirSync(trashFolder);
      }

      const trashImagePath2 = path.join(trashFolder, path.basename(imagePath2));
      
      // Gunakan fs-extra untuk memastikan pemindahan yang andal
      await fs.move(imagePath2, trashImagePath2);
    }

    await asset.destroy();

    res.status(200).json({ msg: "Asset Deleted Successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

