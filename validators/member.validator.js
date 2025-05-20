import Joi from 'joi';

const memberSchema = Joi.object({
  fullName: Joi.string().required().trim(),
  gender: Joi.string().valid('Male', 'Female', 'Other').required(),
  dateOfBirth: Joi.date().required(),
  phoneNumber: Joi.string().required().trim(),
  email: Joi.string().email().required().trim().lowercase(),
  homeAddress: Joi.string().required().trim(),
  city: Joi.string().required().trim(),
  region: Joi.string().required().trim(),
  occupation: Joi.string().trim(),
  employer: Joi.string().trim(),
  educationLevel: Joi.string().trim(),
  maritalStatus: Joi.string().valid('Single', 'Married', 'Divorced', 'Widowed').required(),
  spouseName: Joi.string().trim(),
  childrenNames: Joi.array().items(Joi.string().trim()),
  baptismDate: Joi.date(),
  spiritualGifts: Joi.array().items(Joi.string().trim()),
  departmentsInvolved: Joi.array().items(Joi.string().trim()),
  membershipStatus: Joi.string().valid('Visitor', 'New Member', 'Active', 'Inactive'),
  emergencyContact: Joi.object({
    name: Joi.string().required().trim(),
    relationship: Joi.string().required().trim(),
    phoneNumber: Joi.string().required().trim()
  }).required(),
  medicalNotes: Joi.string().trim(),
  profilePictureURL: Joi.string().trim()
});

export const validateMember = (req, res, next) => {
  const { error } = memberSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path[0],
      message: detail.message
    }));
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors
    });
  }
  next();
}; 