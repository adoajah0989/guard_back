import Patroli from "../models/PatroliModel.js";

export const updatePatroli = async (req, res) => {
    try {
        const { 
            id,
            tanggal, 
            lokasi,
            urai_temuan,
            tindak,
            status
        } = req.body;
        const patroliToUpdate = await Patroli.findByPk(id);

        if (!patroliToUpdate) {
            return res.status(404).json({ msg: "Record tidak ditemukan" });
        }
        patroliToUpdate.tanggal = tanggal;
        patroliToUpdate.lokasi = lokasi;
        patroliToUpdate.urai_temuan = urai_temuan;
        patroliToUpdate.tindak = tindak;
        patroliToUpdate.status = status;
        await patroliToUpdate.save();

        res.json({ msg: "Data patroli berhasil diperbarui" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};
