import Joi from "joi";

export function checkRegisterRequest() {
    return (req, res, next) => {
      const registerForm = Joi.object({
        username: Joi.string().min(3).max(30).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
        role: Joi.string().min(4).max(5).required()
      })
  
      const { error } = registerForm.validate(req.body);
      if (error) {
        console.log(error.details[0].message);
        return res.status(400).json({ error: error.details[0].message });
      }
      next();
    }
}


export function checkEntryRequest() {
    return (req, res, next) => {
      const entryForm = Joi.object({
        title: Joi.string().min(1).max(50).required(),
        start: Joi.string().isoDate().required(),
        end: Joi.string().isoDate().required(),
        description: Joi.string().max(1024).optional(),
        photos: Joi.array().items(
            Joi.object({
                originalname: Joi.string().required(),
                mimetype: Joi.string().valid("image/jpeg", "image/png").required(),
                buffer: Joi.binary().required(),
            })
        ).optional(),
      })
  
      const { error } = entryForm.validate(req.body);
      if (error) {
        console.log(error.details[0].message);
        return res.status(400).json({ error: error.details[0].message});
      }
      next();
    }
}