const ContactMessage = require("../models/ContactMessage");

const createContactMessage = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      subject,
      message,
    } = req.body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({
        message: "Name, email and message are required.",
      });
    }

    const contactMessage = await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : "",
      subject: subject ? subject.trim() : "General inquiry",
      message: message.trim(),
      status: "unread",
    });

    return res.status(201).json(contactMessage);
  } catch (error) {
    console.error("Create contact message error:", error);

    return res.status(500).json({
      message: "Failed to send your message.",
    });
  }
};

const getContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({
      createdAt: -1,
    });

    return res.status(200).json(messages);
  } catch (error) {
    console.error("Get contact messages error:", error);

    return res.status(500).json({
      message: "Failed to load contact messages.",
    });
  }
};

const markContactMessageAsRead = async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      {
        status: "read",
      },
      {
        new: true,
      },
    );

    if (!message) {
      return res.status(404).json({
        message: "Contact message not found.",
      });
    }

    return res.status(200).json(message);
  } catch (error) {
    console.error("Mark contact message read error:", error);

    return res.status(500).json({
      message: "Failed to update contact message.",
    });
  }
};

const deleteContactMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndDelete(
      req.params.id,
    );

    if (!message) {
      return res.status(404).json({
        message: "Contact message not found.",
      });
    }

    return res.status(200).json({
      message: "Contact message deleted successfully.",
    });
  } catch (error) {
    console.error("Delete contact message error:", error);

    return res.status(500).json({
      message: "Failed to delete contact message.",
    });
  }
};

module.exports = {
  createContactMessage,
  getContactMessages,
  markContactMessageAsRead,
  deleteContactMessage,
};