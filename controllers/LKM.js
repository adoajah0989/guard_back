import LKM from "../models/LKMModels.js";

export const createLKM = async (req, res) => {
  try {
    const { list_lkm, urai, status } = req.body;
    const existingLKM = await LKM.findByPk(list_lkm);

    if (existingLKM) {
      await existingLKM.update({
        urai,
        status,
      });

      res.status(200).json({ msg: "LKM updated successfully", data: existingLKM });
    } else {
      const newLKM = await LKM.create({
        list_lkm,
        urai,
        status
      });

      res.status(201).json({ msg: "LKM created successfully", data: newLKM });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};
