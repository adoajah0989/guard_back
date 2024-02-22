import Darurat from "../models/daruratModel.js";
import {Op} from "sequelize";

export const getDarurat = async (req, res) => {
  try {
    const { search } = req.query;
    let whereClause = {};

    if (search) {
      whereClause = {
        lokasi: {
          [Op.like]: `%${search}%`,
        },
      };
    }

    const result = await Darurat.findAll({
      where: whereClause,
    });

    if (result.length === 0) {
      res.status(404).json({ message: 'Data not found' });
    } else {
      res.status(200).json(result);
    }
  } catch (error) {
    console.error('Error in getDarurat:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

  export const addDarurat = async (req, res) => {
    try {
      // Ambil data dari body request
      const {
        lokasi,
        nomor,
        type,
      } = req.body;
  
      // Simpan data ke database
      const newDarurat = await Darurat.create({
        lokasi,
        nomor,
        type
      });
  
      // Kirim respons sukses ke client
      res.status(201).json({ message: 'Data successfully added', data: newDarurat });
    } catch (error) {
      console.error('Error in addDarurat:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  export const editDarurat = async (req, res) => {
    try {
      // Ambil ID dari parameter URL
      const { id } = req.params;
  
      // Ambil data yang akan diubah dari body request
      const { lokasi, nomor, type } = req.body;
  
      // Cari data darurat berdasarkan ID
      const existingDarurat = await Darurat.findByPk(id);
  
      // Jika data tidak ditemukan, kirim respons 404
      if (!existingDarurat) {
        return res.status(404).json({ error: 'Data not found' });
      }
  
      // Lakukan pembaruan data
      existingDarurat.lokasi = lokasi;
      existingDarurat.nomor = nomor;
      existingDarurat.type = type;
  
      // Simpan perubahan ke database
      await existingDarurat.save();
  
      // Kirim respons sukses ke client
      res.status(200).json({ message: 'Data successfully updated', data: existingDarurat });
    } catch (error) {
      console.error('Error in editDarurat:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  export const deleteDarurat = async (req, res) => {
    const { id } = req.params;
  
    try {
      const deletedDarurat = await Darurat.destroy({
        where: {
          id: id,
        },
      });
  
      if (deletedDarurat === 1) {
        res.json({ message: "Data deleted successfully" });
      } else {
        res.status(404).json({ error: "Data not found" });
      }
    } catch (error) {
      console.error("Error deleting darurat:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
