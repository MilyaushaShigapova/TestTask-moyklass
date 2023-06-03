const models = require('../models');
const Op = models.Sequelize.Op;

async function getAllLessons(query) {
  return await models.Lesson.findAll(query);
}
async function getLessonsStudents(lessonsArrId) {
  return await models.LessonStudents.findAll({
    where: {
      lesson_id: {
        [Op.in]: lessonsArrId,
      },
    },
  });
}

async function getTeachers(teacherIds) {
  return await models.Teacher.findAll({
    where: {
      id: {
        [Op.in]: teacherIds,
      },
    },
  });
}
async function createLesson(query, teacherIds) {
  let lessonsArrId = [];
  const t = await models.sequelize.transaction();
  try {
    let lessons = await models.Lesson.bulkCreate(query, { transaction: t });

    for (const el of lessons) {
      await el.setTeachers(teacherIds, { transaction: t });
      lessonsArrId.push(el.id);
    }

    await t.commit();
    return lessonsArrId;
  } catch (error) {
    await t.rollback();
    throw new Error(error.message);
  }
}

module.exports = {
  getAllLessons,
  getLessonsStudents,
  getTeachers,
  createLesson,
};
