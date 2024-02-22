import express from "express";
import {
  getUsers,
  Register,
  Login,
  Logout,
  getDropdownOptions,
} from "../controllers/Users.js";
import { getGuests, updateGuest, createGuest, getGuestById,deleteGuest } from "../controllers/Guest.js";
import { verifyToken } from "../middleware/VerifyToken.js";
import { refreshToken } from "../controllers/RefreshToken.js";
import {
  createPatroli,
  updatePatroli,
  uploadPhotoPatroli,
  getPatroli,
  getPatroliById,
  savePatroli,
  deletePatroli,
} from "../controllers/Patroli.js";
import {
  getExpedisi,
  getExpedisiById,
  deleteExpedisi,
  uploadEkspedisi,
  createEkspedisi,
  updateEkspedisi,
} from "../controllers/Expedisi.js";
import { 
  handleUpload, 
  uploadPhotos, 
  getAsset,
  getAssetById,
  saveAsset,
  deleteAsset} from "../controllers/Asset.js";
import { uploadLapdi, createLapdi, getLapdi,deleteLapdi } from "../controllers/Lapdi.js";
import { LoginAtasan, getAtasan } from "../controllers/Atasan.js";
import { createLKM } from "../controllers/LKM.js";
import { addDarurat, deleteDarurat, editDarurat, getDarurat } from "../controllers/darurat.js";
import { createBarcode } from "../controllers/Barcode.js";
import { createBAP, deleteBAP, getBap,uploadPDF } from "../controllers/BAP.js";
import { getMutasi, getMutasiById, handleDeleteMutasi,updateMutasi } from "../controllers/bukuMutasi.js";
import { deleteInOut, getinOut, getinOutById,uploadInOut,createInOut, updateInOutBawah } from "../controllers/InOut.js";
const router = express.Router();

// Metode GET
router.get('/users', verifyToken, getUsers);
router.get('/token', refreshToken);
router.get('/anggota', getDropdownOptions);
router.get('/data', getLapdi);
router.get('/atasan', getAtasan);
router.get('/guests', getGuests);
router.get('/guests/:id', getGuestById);
router.get('/lapdi', getLapdi);
router.get('/mutasi', getMutasi);
router.get('/mutasi/:id', getMutasiById);
router.get('/expedisi/:id', getExpedisiById);
router.get('/asset/:id', getAssetById);
router.get('/expedisi', getExpedisi);
router.get('/asset', getAsset);
router.get('/bap', getBap);
router.get('/darurat', getDarurat);
router.get('/ekspedisi', getExpedisi);
router.get('/ekspedisi/:id', getExpedisiById);
router.get('/InOut', getinOut);
router.get('/InOut/:id', getinOutById);
router.get('/patroli',getPatroli)
router.get('/patroli/:id',getPatroliById)

// Metode POST
router.post('/users', Register);
router.post('/login', Login);
router.post('/guest', createGuest);
router.post('/mutasi', updateMutasi);
router.post('/patroli', uploadPhotoPatroli, createPatroli);
router.post('/ekspedisi', uploadEkspedisi, createEkspedisi);
router.post('/upload', uploadPhotos, handleUpload);
router.post('/lapdi', uploadLapdi, createLapdi);
router.post('/loginatas', LoginAtasan);
router.post('/lkm', createLKM);
router.post('/barcode', createBarcode);
router.post('/bap', createBAP);
router.post('/ekspedisi', uploadEkspedisi, createEkspedisi);
router.post('/inout', uploadInOut, createInOut);
router.post('/pdf', uploadPDF);
router.post('/darurat', addDarurat);
router.post('/asset', saveAsset);


// Metode DELETE
router.delete('/logout', Logout);
router.delete('/guests/:id', deleteGuest);
router.delete('/lapdi/:id', deleteLapdi);
router.delete('/patroli/:id', deletePatroli);
router.delete('/expedisi/:id', deleteExpedisi);
router.delete('/mutasi/:id', handleDeleteMutasi);
router.delete('/asset/:id', deleteAsset);
router.delete('/inout/:id', deleteInOut);
router.delete('/darurat/:id', deleteDarurat);
router.delete('/BAP/:id', deleteBAP);


// Metode PUT/PATCH
router.put('/guest/:id', updateGuest);
router.put('/patroli/:id', updatePatroli);
router.put('/expedisi/:id', updateEkspedisi);
router.put('/darurat/:id', editDarurat);
router.patch('/guests/:id', updateGuest);
router.patch('/patroli/:id', updatePatroli);
router.patch('/expedisi/:id', updateEkspedisi);
router.patch('/inout/:id', updateInOutBawah);




export default router;
