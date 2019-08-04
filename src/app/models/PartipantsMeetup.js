import Sequelize, { Model } from "sequelize";

class ParticipantsMeetup extends Model {
  static init(sequelize) {
    super.init(
      {
        participant_id: Sequelize.INTEGER,
        meetup_id: Sequelize.INTEGER
      },
      {
        sequelize
      }
    );

    return this;
  }
}

export default ParticipantsMeetup;
