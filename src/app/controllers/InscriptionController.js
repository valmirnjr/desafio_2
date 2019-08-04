import { isBefore, closestTo, differenceInHours } from "date-fns";
import { Op } from "sequelize";

import Meetup from "../models/Meetup";
import User from "../models/User";
import ParticipantsMeetup from "../models/PartipantsMeetup";

class InscriptionController {
  async store(req, res) {
    const { meetupId } = req.params;

    const meetup = await Meetup.findByPk(meetupId);

    if (!meetup) {
      return res
        .status(422)
        .json({ error: "No meetup was found for the id passed" });
    }

    const participant = await User.findByPk(req.userId);

    if (meetup.user_id === participant.id) {
      return res.status(422).json({
        error: "You can't inscript yourself in meetups organized by you"
      });
    }

    const checkUserInscripted = await ParticipantsMeetup.findOne({
      where: {
        participant_id: participant.id,
        meetup_id: meetup.id
      }
    });

    if (checkUserInscripted) {
      return res
        .status(422)
        .json({ error: "You are already inscripted in this meetup" });
    }

    const { date } = meetup;

    if (isBefore(date, new Date())) {
      return res.status(422).json({
        error: "This meetup has already passed"
      });
    }

    /*
     * Check close meetups
     */

    const userInscriptions = await ParticipantsMeetup.findAll({
      where: {
        participant_id: participant.id
      },
      attributes: ["meetup_id"]
    }).map(element => element.meetup_id);

    const userMeetupsDates = await Meetup.findAll({
      attributes: ["id", "date"]
    })
      .filter(meetupItem => userInscriptions.includes(meetupItem.id))
      .map(item => item.date);

    const closestDate = closestTo(date, userMeetupsDates);

    if (Math.abs(differenceInHours(date, closestDate)) <= 1) {
      return res
        .status(422)
        .json({ error: "You already have a meetup close to this date" });
    }

    await participant.addMeetup(meetup);

    return res.json();
  }

  async index(req, res) {
    const userInscriptions = await ParticipantsMeetup.findAll({
      where: {
        participant_id: req.userId
      },
      attributes: ["meetup_id"]
    }).map(element => element.meetup_id);

    const userMeetups = await Meetup.findAll({
      where: {
        id: {
          [Op.or]: userInscriptions
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
      ]
    });

    return res.json(userMeetups);
  }
}

export default new InscriptionController();
