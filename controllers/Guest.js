import Guest from "../models/GuestModel.js";
import { Op, literal } from "sequelize";

export const getGuests = async (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search_query || "";
  const offset = limit * page;
  const startDate = req.query.startDate || ""; // Tambahkan ini
  const endDate = req.query.endDate || "";

  const dateFilter =
    startDate && endDate
      ? {
          tanggal: {
            [Op.between]: [startDate, endDate],
          },
        }
      : {};
  const totalRows = await Guest.count({
    where: {
      [Op.or]: [
        {
          nama: {
            [Op.like]: "%" + search + "%",
          },
        },
        {
          tanggal: {
            [Op.like]: "%" + search + "%",
          },
        },
        {
          alamat: {
            [Op.like]: "%" + search + "%",
          },
        },
        {
          orang_yang_dituju: {
            [Op.like]: "%" + search + "%",
          },
        },
        {
          keperluan: {
            [Op.like]: "%" + search + "%",
          },
        },
        {
          no_kendaraan: {
            [Op.like]: "%" + search + "%",
          },
        },
        {
          no_ktp: {
            [Op.like]: "%" + search + "%",
          },
        },
        {
          catatan: {
            [Op.like]: "%" + search + "%",
          },
        },
      ],
    },
  });

  const totalPage = Math.ceil(totalRows / limit);
  try {
    const result = await Guest.findAll({
      attributes: [
        "id",
        [literal("DATE_FORMAT(tanggal, '%d %m %Y')"), "formattedTanggal"], // Format tanggal di sini
        "nama",
        "alamat",
        "orang_yang_dituju",
        "keperluan",
        "no_kendaraan",
        "no_ktp",
        "catatan",
      ],
      where: {
        [Op.and]: [
          // (Tambahkan bagian ini untuk filter tanggal)
          dateFilter,
          // (Lanjutkan dengan filter pencarian seperti sebelumnya)
          {
            [Op.or]: [
              {
                nama: {
                  [Op.like]: "%" + search + "%",
                },
              },
              {
                tanggal: {
                  [Op.like]: "%" + search + "%",
                },
              },
              {
                alamat: {
                  [Op.like]: "%" + search + "%",
                },
              },
              {
                orang_yang_dituju: {
                  [Op.like]: "%" + search + "%",
                },
              },
              {
                keperluan: {
                  [Op.like]: "%" + search + "%",
                },
              },
              {
                no_kendaraan: {
                  [Op.like]: "%" + search + "%",
                },
              },
              {
                no_ktp: {
                  [Op.like]: "%" + search + "%",
                },
              },
              {
                catatan: {
                  [Op.like]: "%" + search + "%",
                },
              },
            ],
          },
        ],
      },
      offset: offset,
      limit: limit,
      order: [["id", "DESC"]],
    });

    if (result.length === 0) {
      res.status(404).json({
        error: "Data not found",
      });
    } else {
      res.json({
        result: result,
        page: page,
        limit: limit,
        totalRows: totalRows,
        totalPage: totalPage,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

export const getGuestById = async (req, res) => {
  try {
    const response = await Guest.findOne({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
  }
};

export const createGuest = async (req, res) => {
    try {
        const { nama, tanggal, alamat, orang_yang_dituju, keperluan, no_kendaraan, no_ktp, catatan } = req.body;

        const newGuest = await Guest.create({
            nama,
            tanggal,
            alamat,
            orang_yang_dituju,
            keperluan,
            no_kendaraan,
            no_ktp,
            catatan
        });

        res.status(201).json({ id: newGuest.id, msg: "Data Guest berhasil dibuat" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

export const updateGuest = async (req, res) => {
    try{
    const { id } = req.params;
    const {catatan} = req.body;
    const guestToUpdate = await Guest.findByPk(id);
    if(!guestToUpdate) {
        return res.status(404).json({msg : 'Record tidak ditemukan'});
}
    guestToUpdate.catatan = catatan;
    await guestToUpdate.save();
    res.json({msg: 'Data Guest berhasil diperbarui'});
} catch(error){
    console.log(error);
    res.status(500).json({msg: 'Error'})
}
}

export const deleteGuest = async (req, res) => {
  try {
    await Guest.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ msg: "Deleted guets success" });
  } catch (error) {
    console.log(error.message);
  }
};
