import BAP from "../models/BAPModel.js";
import {Op, literal} from "sequelize";
 
export const createBAP = async (req, res) => {
  try {
      const { 
          tanggal,
          jam,
          pemeriksa,
          diperiksa,
          ttl,
          pekerjaan,
          alamat,
          ktp,
          hp,
          pertanyaan1,
          pertanyaan2,
          pertanyaan3,
          pertanyaan4,
          pertanyaan5,
          jawaban1,
          jawaban2,
          jawaban3,
          jawaban4,
          jawaban5,
      } = req.body;

      const pertanyaan4_value = pertanyaan4 ? pertanyaan4 : '';
      const pertanyaan5_value = pertanyaan5 ? pertanyaan5 : '';
      const jawaban4_value = jawaban4 ? jawaban4 : '';
      const jawaban5_value = jawaban5 ? jawaban5 : '';

      await BAP.create({
          tanggal,
          jam,
          pemeriksa,
          diperiksa,
          ttl,
          pekerjaan,
          alamat,
          ktp,
          hp,
          pertanyaan1,
          pertanyaan2,
          pertanyaan3,
          pertanyaan4_value,
          pertanyaan5_value,
          jawaban1,
          jawaban2,
          jawaban3,
          jawaban4_value,
          jawaban5_value,
      });

      res.json({ msg: "Data mutasi berhasil diupdate" });
  } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "Internal Server Error" });
  }
}

const generateFilename = (prefix, counter, extension) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const fileNumber = counter;
  const formattedDate = `${day}-${month}-${year}`;
  return `${prefix}_${fileNumber}_${formattedDate}${extension}`;
};

export const uploadPDF = async (req, res) => {
  const htmlContent = req.body.htmlContent;

  const todayDate = new Date();
  const day = todayDate.getDate().toString().padStart(2, '0');
  const month = (todayDate.getMonth() + 1).toString().padStart(2, '0');
  const year = todayDate.getFullYear();
  const dateString = `${day}-${month}-${year}`;

  const folderPath = path.join('public/file/pdf', dateString);
  const filename = generateFilename('pdf', pdfCounter, '.pdf');
  const filePath = path.join(folderPath, filename);

  try {
      await fs.promises.mkdir(folderPath, { recursive: true });

      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setContent(htmlContent);

      const pdfBuffer = await page.pdf({
          format: 'A4',
          path: filePath,
      });

      await browser.close();

      pdfCounter++;

      res.send(pdfBuffer);
  } catch (error) {
      console.error('Error generating PDF:', error);
      res.status(500).send('Error generating PDF.');
  }
};

export const getBap = async (req, res) => {
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

  const totalRows = await BAP.count({
    where: {
      [Op.or]: [
        { tanggal: { [Op.like]: '%' + search + '%' } },
        { jam: { [Op.like]: '%' + search + '%' } },
        { pemeriksa: { [Op.like]: '%' + search + '%' } },
        { diperiksa: { [Op.like]: '%' + search + '%' } },
        { ttl: { [Op.like]: '%' + search + '%' } },
        { pekerjaan: { [Op.like]: '%' + search + '%' } },
        { alamat: { [Op.like]: '%' + search + '%' } },
        { ktp: { [Op.like]: '%' + search + '%' } },
        { hp: { [Op.like]: '%' + search + '%' } },
        { pertanyaan1: { [Op.like]: '%' + search + '%' } },
        { pertanyaan2: { [Op.like]: '%' + search + '%' } },
        { pertanyaan3: { [Op.like]: '%' + search + '%' } },
        { pertanyaan4: { [Op.like]: '%' + search + '%' } },
        { pertanyaan5: { [Op.like]: '%' + search + '%' } },
      ]
    },
  });

  const totalPage = Math.ceil(totalRows / limit);
  const result = await BAP.findAll({
    attributes: [
      'id',
      [literal("DATE_FORMAT(tanggal, '%d %m %Y')"), 'formattedTanggal'],
      'jam',
      'pemeriksa',
      'diperiksa',
      'ttl',
      'pekerjaan',
      'alamat',
      'ktp',
      'hp',
      'pertanyaan1',
      'pertanyaan2',
      'pertanyaan3',
      'pertanyaan4',
      'pertanyaan5',
      'jawaban1', // Tambahkan kolom jawaban ke sini
      'jawaban2', // Tambahkan kolom jawaban ke sini
      'jawaban3', // Tambahkan kolom jawaban ke sini
      'jawaban4', // Tambahkan kolom jawaban ke sini
      'jawaban5', // Tambahkan kolom jawaban ke sini
    ],
    where: {
      [Op.and]: [
        dateFilter,
        {
          [Op.or]: [
            { tanggal: { [Op.like]: '%' + search + '%' } },
            { jam: { [Op.like]: '%' + search + '%' } },
            { pemeriksa: { [Op.like]: '%' + search + '%' } },
            { diperiksa: { [Op.like]: '%' + search + '%' } },
            { ttl: { [Op.like]: '%' + search + '%' } },
            { pekerjaan: { [Op.like]: '%' + search + '%' } },
            { alamat: { [Op.like]: '%' + search + '%' } },
            { ktp: { [Op.like]: '%' + search + '%' } },
            { hp: { [Op.like]: '%' + search + '%' } },
            { pertanyaan1: { [Op.like]: '%' + search + '%' } },
            { pertanyaan2: { [Op.like]: '%' + search + '%' } },
            { pertanyaan3: { [Op.like]: '%' + search + '%' } },
            { pertanyaan4: { [Op.like]: '%' + search + '%' } },
            { pertanyaan5: { [Op.like]: '%' + search + '%' } },
          ]
        },
      ],
    },
    offset: offset,
    limit: limit,
    order: [
      ['tanggal', 'DESC']
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

export const getBapById = async (req, res) => {
  try {
    const response = await BAP.findOne({
      where: {
        id: req.params.id
      }
    });
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

export const deleteBAP = async (req, res) => {
  try {
    await BAP.destroy({
      where: {
        id: req.params.id
      }
    });
    res.status(200).json({ msg: "Deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};