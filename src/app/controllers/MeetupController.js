import * as Yup from "yup";
import { parseISO, isBefore, startOfDay, endOfDay } from "date-fns";
import { Op } from "sequelize";

import Meetup from "../models/Meetup";
import User from "../models/User";
// import File from "../models/File";

class MeetupController {
  async index(req, res) {
    const { date } = req.query;
    const parsedDate = parseISO(date);

    const { page = 1 } = req.query;

    const meetups = await Meetup.findAll({
      where: {
        date: {
          [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)]
        }
      },
      order: ["date"],
      attributes: [
        "title",
        "description",
        "location",
        "date",
        "banner_url",
        "path"
      ],
      limit: 10,
      offset: (page - 1) * 10,
      include: [
        {
          model: User,
          as: "organizer",
          attributes: ["name", "email"]
          /* include: [
            {
              model: File,
              as: "avatar",
              attributes: ["path", "avatar_url"]
            }
          ] */
        }
      ]
    });

    return res.json(meetups);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      description: Yup.string(),
      location: Yup.string(),
      date: Yup.date()
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: "Validation failed." });
    }

    const { id } = req.params;

    const meetup = await Meetup.findByPk(id);

    if (!meetup) {
      return res
        .status(400)
        .json({ error: "No meetup found for the id passed" });
    }

    if (meetup.user_id !== req.userId) {
      return res
        .status(401)
        .json({ error: "You can't edit someone else's meetup" });
    }

    if (isBefore(meetup.date, new Date())) {
      return res.status(401).json({ error: "This meetup has already passed" });
    }

    const { title, description, location, date } = await meetup.update(
      req.body
    );

    const { originalname: banner_name, filename: path } = await meetup.update(
      req.file
    );

    return res.json({
      title,
      description,
      location,
      date,
      banner_name,
      path
    });
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required()
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: "Validation failed." });
    }

    /*
     * Chech for past dates
     */
    const { date } = req.body;

    if (isBefore(parseISO(date), new Date())) {
      return res.status(400).json({ error: "Past dates are not permitted" });
    }

    const { originalname: banner_name, filename: path } = req.file;

    const { title, description, location } = req.body;

    const user_id = req.userId;

    const meetup = await Meetup.create({
      user_id,
      title,
      description,
      location,
      date,
      banner_name,
      path
    });

    return res.json(meetup);
  }
}

export default new MeetupController();
