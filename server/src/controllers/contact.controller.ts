import { Request, Response } from 'express';
import Contact from '../models/Contact';

export const createContact = async (req: Request, res: Response) => {
    try {
        const { name, phone, email, subject, message } = req.body;

        if (!name || !phone || !email || !subject || !message) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin!' });
        }

        const newContact = new Contact({ name, phone, email, subject, message });
        await newContact.save();

        return res.status(201).json({
            success: true,
            message: 'Gửi thông tin liên hệ thành công!'
        });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi máy chủ nội bộ', error });
    }
};