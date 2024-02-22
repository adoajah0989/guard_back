import Barcode from "../models/BarcodeModel.js";
export const createBarcode = async (req, res) => {
    try {
        const { lokasi, timestamp } = req.body;


        const newBarcode = await Barcode.create({
            lokasi,
            timestamp
        });

        res.status(201).json({ id: newBarcode.id, msg: "Data Barcode berhasil dibuat" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};