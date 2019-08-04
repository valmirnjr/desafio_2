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

    const meetup = await Meetup.findByPk(meetupId);

    if (!meetup) {
      return res.status(422).json({ error: "Meetup does not exist" });
    }

    if (meetup.user_id !== req.userId) {
      return res.status(403).json({ error: "You can't delete this meetup" });
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
