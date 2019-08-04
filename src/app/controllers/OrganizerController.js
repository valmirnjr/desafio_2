import { Op } from "sequelize";

import Meetup from "../models/Meetup";

class OrganizerController {
  async index(req, res) {
    const meetups = await Meetup.findAll({
      where: {
        user_id: req.userId
      },
      order: ["date"],
      attributes: [
        "title",
        "description",
        "location",
        "date",
        "banner_url",
        "path"
      ]
    });

    return res.json(meetups);
  }

  async delete(req, res) {
    const meetupId = req.params.id;

    const meetupExists = await Meetup.findByPk(meetupId);

    if (!meetupExists) {
      return res.status(422).json({ error: "Meetup does not exist" });
    }
    await Meetup.destroy({
      where: {
        id: meetupId
      },
      date: {
        [Op.gte]: new Date() // A past meetup can't be deleted
      }
    });

    return res.json({ success: "Deleted" });
  }
}

export default new OrganizerController();
