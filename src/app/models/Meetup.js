import Sequelize, { Model } from "sequelize";

class Meetup extends Model {
  static init(sequelize) {
    super.init(
      {
        user_id: Sequelize.INTEGER,
        title: Sequelize.STRING,
        description: Sequelize.STRING,
        location: Sequelize.STRING,
        date: Sequelize.DATE,
        banner_name: Sequelize.STRING,
        path: Sequelize.STRING,
        banner_url: {
          type: Sequelize.VIRTUAL,
          get() {
            return `http://localhost:3333/banners/${this.path}`;
          }
        }
      },
      {
        sequelize
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: "user_id", as: "organizer" });
  }
}

export default Meetup;
