const Address = require("../models/Address");

// ======================================================
// HELPER
// ======================================================

const getUserId = (req) => {
  return req.user?._id || req.user?.id;
};

// ======================================================
// GET USER ADDRESSES
// GET /api/addresses
// LOGIN REQUIRED
// ======================================================

exports.list = async (req, res, next) => {
  try {
    const userId = getUserId(req);

    const addresses = await Address.find({
      user: userId,
    }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    res.json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// GET SINGLE ADDRESS
// GET /api/addresses/:id
// LOGIN REQUIRED
// ======================================================

exports.getById = async (req, res, next) => {
  try {
    const userId = getUserId(req);

    const address = await Address.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    res.json({
      success: true,
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// CREATE ADDRESS
// POST /api/addresses
// LOGIN REQUIRED
// ======================================================

exports.create = async (req, res, next) => {
  try {
    const userId = getUserId(req);

    const {
      fullName,
      phone,
      addressLine,
      city,
      state,
      pincode,
      country,
      landmark,
      type,
      isDefault,
    } = req.body;

    if (
      !fullName ||
      !phone ||
      !addressLine ||
      !city ||
      !state ||
      !pincode
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Full name, phone, address, city, state and pincode are required",
      });
    }

    // Agar new address default hai,
    // existing default address ko false kar do.
    if (isDefault === true) {
      await Address.updateMany(
        { user: userId },
        { $set: { isDefault: false } }
      );
    }

    // Agar user ka first address hai,
    // automatically default bana do.
    const existingCount = await Address.countDocuments({
      user: userId,
    });

    const address = await Address.create({
      user: userId,
      fullName,
      phone,
      addressLine,
      city,
      state,
      pincode,
      country: country || "India",
      landmark: landmark || "",
      type: type || "home",
      isDefault:
        isDefault === true || existingCount === 0,
    });

    res.status(201).json({
      success: true,
      message: "Address added successfully",
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// UPDATE ADDRESS
// PUT /api/addresses/:id
// LOGIN REQUIRED
// ======================================================

exports.update = async (req, res, next) => {
  try {
    const userId = getUserId(req);

    const address = await Address.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    if (req.body.isDefault === true) {
      await Address.updateMany(
        {
          user: userId,
          _id: { $ne: req.params.id },
        },
        {
          $set: {
            isDefault: false,
          },
        }
      );
    }

    Object.assign(address, req.body);

    await address.save();

    res.json({
      success: true,
      message: "Address updated successfully",
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// SET DEFAULT ADDRESS
// PATCH /api/addresses/:id/default
// LOGIN REQUIRED
// ======================================================

exports.setDefault = async (req, res, next) => {
  try {
    const userId = getUserId(req);

    const address = await Address.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    await Address.updateMany(
      {
        user: userId,
      },
      {
        $set: {
          isDefault: false,
        },
      }
    );

    address.isDefault = true;

    await address.save();

    res.json({
      success: true,
      message: "Default address updated successfully",
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// DELETE ADDRESS
// DELETE /api/addresses/:id
// LOGIN REQUIRED
// ======================================================

exports.remove = async (req, res, next) => {
  try {
    const userId = getUserId(req);

    const address = await Address.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    const wasDefault = address.isDefault;

    await Address.deleteOne({
      _id: req.params.id,
      user: userId,
    });

    // Agar default address delete hui,
    // to doosri address ko default bana do.
    if (wasDefault) {
      const nextAddress = await Address.findOne({
        user: userId,
      }).sort({
        createdAt: -1,
      });

      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    res.json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
