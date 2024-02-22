import Atasan from "../models/AtasanModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
 
export const getAtasan = async(req, res) => {
    try {
        const atasan = await Atasan.findAll({
            attributes:['id','name','email']
        });
        res.json(atasan);
    } catch (error) {
        console.log(error);
    }
}
 
export const Regis = async (req, res) => {
    const { name, email, password, confPassword } = req.body;
    if (password !== confPassword) return res.status(400).json({ msg: "Password dan Confirm Password tidak sesuai" });
  
    try {
      await Atasan.create({
        name: name,
        email: email,
        password: password
      });
      res.json({ msg: "Registrasi Sukses" });
      alert('Registrasi Sukses');
    } catch (error) {
      console.log(error);
    }
  }
  
  export const LoginAtasan = async (req, res) => {
    console.log('api2');
    try {
      const atasan = await Atasan.findOne({
        where: {
          email: req.body.email
        }
      });
  
      if (!atasan) {

        return res.status(400).json({ msg: "Email tidak ditemukan" });
      }
  
      if (req.body.password !== atasan.password) {
        return res.status(400).json({ msg: "Password yang dimasukkan Salah" });
      }
  
      const atasanId = atasan.id;
      const name = atasan.name;
      const email = atasan.email;
  
      const accessToken = jwt.sign({ atasanId, name, email }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '15s'
      });
  
      const refreshToken = jwt.sign({ atasanId, name, email }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '1d'
      });
  
      await Atasan.update({ refresh_token: refreshToken }, {
        where: {
          id: atasanId
        }
      });
  
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
      });
  
      res.json({ accessToken });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Terjadi kesalahan server" });
    }
  };

export const Logout = async(req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if(!refreshToken) return res.sendStatus(204);
    const user = await Atasan.findAll({
        where:{
            refresh_token: refreshToken
        }
    });
    if(!user[0]) return res.sendStatus(204);
    const userId = user[0].id;
    await Atasan.update({refresh_token: null},{
        where:{
            id: userId
        }
    });
    res.clearCookie('refreshToken');
    return res.sendStatus(200);
}

export const getDropdownOptions = async (req, res) => {
  try {
    const atasan = await Atasan.findAll({
      attributes: ['name'],
    });

    const dropdownOptions = atasan.map((atasan) => ({
      label: atasan.name,
      value: atasan.name,
    }));

    res.json(dropdownOptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};