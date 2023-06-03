const models = require('../models');
const Op = models.Sequelize.Op;
const sequelize = models.sequelize;
const {
  getAllLessons,
  getLessonsStudents,
  getTeachers,
  createLesson,
} = require('./lessons.servise');

const getList = async (req, res, next) => {
  let lessons = [];
  try {
    if (Object.keys(req.query).length != 0) {
      let query = {
        where: {},
        include: [
          {
            model: models.Student,
          },
        ],
      };
      //проверка параметров
      query = await checkParam(req, query);
      //Получение всех Занятий
      lessons = await getAllLessons(query);
    } else {
      let query = {
        where: {},
        include: [
          {
            model: models.Student,
          },
          {
            model: models.Teacher,
          },
        ],
      };
      lessons = await getAllLessons(query);
    }

    //Получение списка Id занятий
    let lessonsArrId = [];
    lessons.forEach((el) => lessonsArrId.push(el.id));

    //Получение списка Занятия-ученики
    let lessonStudents = [];
    lessonStudents = await getLessonsStudents(lessonsArrId);

    //Получение списка количество посещений
    let visitCountsLesson = await getVisitCount(lessonsArrId, lessonStudents);

    //формирования ответа
    let result = await getResult(lessons, visitCountsLesson);

    return res.status(200).json(result);
  } catch (e) {
    next(e.message);
  }
};
const createLessons = async (req, res, next) => {
  let param = req.body;
  try {
    //Проверка обязат. параметров
    if (!param.teacherIds || !param.title || !param.firstDate || !param.days) {
      throw new Error('Ошибка, введите все параметры');
    }
    let query = await checkParamCreateLesson(param);
    let teachers = [];
    teachers = await getTeachers(param.teacherIds);
    let result = await createLesson(query, teachers);
    return res.status(200).json(result);
  } catch (e) {
    next(e.message);
  }
};

//проверка параметров
async function checkParam(req, query) {
  let param = req.query;
  let page = param.page || 1;
  let lessonsPerPage = param.lessonsPerPage || 5;

  if (param.teacherIds) {
    let teachers = param.teacherIds.split(',');
    query.include.push({
      model: models.Teacher,
      where: {
        id: {
          [Op.in]: teachers,
        },
      },
    });
  } else {
    query.include.push({
      model: models.Teacher,
    });
  }
  if (param.date) {
    let date = param.date.split(',');
    let filterName = sequelize.cast(sequelize.col('date'), 'varchar');
    if (date.length > 1) {
      let startDate;
      let endDate;
      if (date[0] <= date[1]) {
        startDate = date[0];
        endDate = date[1];
      } else {
        startDate = date[1];
        endDate = date[0];
      }
      query.where.filterName = models.sequelize.where(filterName, {
        [Op.between]: [startDate, endDate],
      });
    } else {
      query.where.filterName = sequelize.where(filterName, date[0]);
    }
  }
  if (param.status) {
    if (param.status != 0 && param.status != 1) {
      throw new Error('Параметр - Status должен иметь значение 1 или 0');
    } else {
      query.where.status = param.status;
    }
  }
  if (param.page) {
    if (page > 1) {
      page--;
      query.offset = page * lessonsPerPage;
    }
  }
  query.limit = lessonsPerPage;

  return query;
}

//Получение списка количество посещений
async function getVisitCount(lessonsArrId, lessonStudents) {
  let visitCountsLesson = lessonsArrId.map(function (item) {
    return {
      lesson_id: item,
      visitCount: 0,
    };
  });
  for (let i = 0; i < lessonStudents.length; i++) {
    let index = visitCountsLesson.findIndex(
      (el) => lessonStudents[i].LessonId === el.lesson_id
    );
    if (lessonStudents[i].visit === true) visitCountsLesson[index].visitCount++;
  }
  return visitCountsLesson;
}
//Формирование ответа
async function getResult(lessons, visitCountsLesson) {
  let result = [];
  lessons.forEach(function (el) {
    let teachers = el['Teachers'].map(function (item) {
      return {
        id: item.id,
        name: item.name,
      };
    });
    let students = el['Students'].map(function (item) {
      return {
        id: item.id,
        name: item.name,
        visit: item['LessonStudents'].visit,
      };
    });
    result.push({
      id: el.id,
      date: el.date,
      title: el.title,
      status: el.status,
      visitCount: visitCountsLesson.find((i) => el.id === i.lesson_id)
        .visitCount,
      students: students,
      teachers: teachers,
    });
  });
  return result;
}

async function checkParamCreateLesson(param) {
  //ПРоверка дней на уникальность и коррректность
  let uniqueDays = [];
  if (param.days) {
    param.days = param.days.filter((item) => /^[0-6]$/.test(item));
    uniqueDays = param.days.filter(
      (item, i, ar) => ar.indexOf(Number(item)) === i
    );
    uniqueDays.sort();
  }

  //Установка ограничений по количесву занятий
  let lessonsCount = 300;
  if (param.lessonsCount) {
    if (param.lessonsCount < lessonsCount) {
      lessonsCount = param.lessonsCount;
    }
  }

  //Установка огран.по дате 1 год
  let firstDate = new Date(param.firstDate);
  let lastDate = new Date(param.firstDate);
  lastDate.setFullYear(lastDate.getFullYear() + 1);
  if (param.lastDate) {
    let last = new Date(param.lastDate);
    if (last < lastDate) {
      lastDate = last;
    }
  }

  //формирования данных
  let lessons = [];
  while (lessonsCount > 0) {
    if (uniqueDays.includes(firstDate.getDay())) {
      lessons.push({
        title: param.title,
        date: firstDate.toJSON().split('T')[0],
      });
      lessonsCount--;
    }
    firstDate.setDate(firstDate.getDate() + 1);
    if (firstDate > lastDate) break;
  }

  return lessons;
}
module.exports = {
  getList,
  createLessons,
};
