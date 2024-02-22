import Mutasi from "../models/MutasiModel.js";
import {Op,literal} from "sequelize"; // Adjust the path accordingly


export const updateMutasi = async (req, res) => {
  try {
      const { 
          tanggal, 
          shift, 
          anggota_1, 
          anggota_2, 
          anggota_3,
          kegiatan_1, 
          kegiatan_2, 
          danru_a,
          danru_b 
      } = req.body;

      const kegiatan_2_value = kegiatan_2 ? kegiatan_2 : '';
      const anggota_3_value = anggota_3 ? anggota_3 : '';



      await Mutasi.create({
          tanggal,
          shift,
          anggota_1,
          anggota_2,
          anggota_3: anggota_3_value,
          kegiatan_1,
          kegiatan_2: kegiatan_2_value,
          danru_a,
          danru_b,
      });

      res.json({ msg: "Data mutasi berhasil diupdate" });
  } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "Internal Server Error" });
  }
}

export const getMutasi = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search_query || '';
    const offset = limit * page;
    const startDate = req.query.startDate || '';
    const endDate = req.query.endDate || '';

    const dateFilter = startDate && endDate ? {
      tanggal: {
        [Op.between]: [startDate, endDate]
      }
    } : {};

    const totalRows = await Mutasi.count({
      where: {
        [Op.or]: [
          { tanggal: { [Op.like]: `%${search}%` } },
          { shift: { [Op.like]: `%${search}%` } },
          { anggota_1: { [Op.like]: `%${search}%` } },
          { anggota_2: { [Op.like]: `%${search}%` } },
          { anggota_3: { [Op.like]: `%${search}%` } },
          { kegiatan_1: { [Op.like]: `%${search}%` } },
          { kegiatan_2: { [Op.like]: `%${search}%` } },
          { danru_a: { [Op.like]: `%${search}%` } },
          { danru_b: { [Op.like]: `%${search}%` } },
        ],
        ...dateFilter // Add the date filter here
      }
    });

    const totalPage = Math.ceil(totalRows / limit);

    const result = await Mutasi.findAll({
      attributes: [
        'id',
        [literal("DATE_FORMAT(tanggal, '%d %m %Y')"), 'formattedTanggal'],
        'shift',
        'anggota_1',
        'anggota_2',
        'anggota_3',
        'kegiatan_1',
        'kegiatan_2',
        'danru_a',
        'danru_b'
      ],
      where: {
        [Op.and]: [
          dateFilter,
          {
            [Op.or]: [
              { tanggal: { [Op.like]: `%${search}%` } },
              { shift: { [Op.like]: `%${search}%` } },
              { anggota_1: { [Op.like]: `%${search}%` } },
              { anggota_2: { [Op.like]: `%${search}%` } },
              { anggota_3: { [Op.like]: `%${search}%` } },
              { kegiatan_1: { [Op.like]: `%${search}%` } },
              { kegiatan_2: { [Op.like]: `%${search}%` } },
              { danru_a: { [Op.like]: `%${search}%` } },
              { danru_b: { [Op.like]: `%${search}%` } },
            ]
          },
        ],
      },
      offset: offset,
      limit: limit,
      order: [['id', 'DESC']]
    });

    res.json({
      result: result,
      page: page,
      limit: limit,
      totalRows: totalRows,
      totalPage: totalPage
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};




export const handleDeleteMutasi = async(req, res) =>{
    try {
        await Mutasi.destroy({
            where:{
                id: req.params.id
            }
        });
        res.status(200).json({msg: "Deleted"});
    } catch (error) {
        console.log(error.message);
    }
}



export const getMutasiById = async(req, res) =>{
    try {
        const response = await Mutasi.findOne({
            where:{
                id: req.params.id
            }
        });
        res.status(200).json(response);
    } catch (error) {
        console.log(error.message);
    }
}
