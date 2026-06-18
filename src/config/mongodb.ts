/**
 * MongoDB Schema Designs & Client-side Database Simulation (Mongoose Inspired)
 * For School Analytics, Mentor profiles, Academic records, and Career prediction.
 */

// 1. Mongoose Schema Definitions (for User Reference & Backend implementation)
export const MongoDB_Schemas = {
  Learner: `
    const LearnerSchema = new mongoose.Schema({
      fullName: { type: String, required: true },
      email: { type: String, unique: true },
      province: { type: String, default: 'Mpumalanga' },
      subjects: [{
        name: { type: String, required: true },
        mark: { type: Number, required: true }
      }],
      apsScore: { type: Number, default: 0 },
      careerInterests: [String],
      academicRisk: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
      successProbability: { type: Number, default: 50 },
      isAdopted: { type: Boolean, default: false },
      adoptedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' },
      createdAt: { type: Date, default: Date.now }
    });
  `,

  Mentor: `
    const MentorSchema = new mongoose.Schema({
      fullName: { type: String, required: true },
      email: { type: String, unique: true },
      umpStudentId: { type: String, required: true },
      majorSubjects: [String],
      adoptedLearnersCount: { type: Number, default: 0, max: 3 }, // Smart adoption limit
      impactScore: { type: Number, default: 0 },
      badges: [String],
      createdAt: { type: Date, default: Date.now }
    });
  `,

  SchoolAnalytics: `
    const SchoolAnalyticsSchema = new mongoose.Schema({
      schoolName: { type: String, required: true },
      region: { type: String, required: true },
      averageAps: { type: Number, default: 0 },
      subjectStruggles: [{
        subjectName: { type: String },
        strugglesCount: { type: Number }
      }],
      readinessRate: { type: Number, default: 0 }, // % qualifying for bachelor/diploma
      enrolledStudents: { type: Number, default: 0 }
    });
  `
};

// 2. High-fidelity Client-side LocalDB Simulation representing MongoDB
class LocalMongoDatabase {
  private getStore(collection: string): any[] {
    const data = localStorage.getItem(`mongo_${collection}`);
    return data ? JSON.parse(data) : [];
  }

  private saveStore(collection: string, data: any[]) {
    localStorage.setItem(`mongo_${collection}`, JSON.stringify(data));
  }

  find(collection: string, query: any = {}): any[] {
    const items = this.getStore(collection);
    return items.filter(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
  }

  findOne(collection: string, query: any = {}): any | null {
    const matches = this.find(collection, query);
    return matches.length > 0 ? matches[0] : null;
  }

  insertOne(collection: string, doc: any): any {
    const items = this.getStore(collection);
    const newDoc = {
      _id: 'mongo_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      ...doc
    };
    items.push(newDoc);
    this.saveStore(collection, items);
    return newDoc;
  }

  updateOne(collection: string, query: any, update: any): boolean {
    const items = this.getStore(collection);
    const index = items.findIndex(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });

    if (index !== -1) {
      items[index] = { ...items[index], ...update };
      this.saveStore(collection, items);
      return true;
    }
    return false;
  }

  // Pre-seed Database with Realistic South African School and Mentor Data
  seedIfEmpty() {
    if (this.getStore('schools').length === 0) {
      const mockSchools = [
        {
          schoolName: "Lehawu High School",
          region: "Pienaar, Nelspruit",
          averageAps: 24,
          readinessRate: 48,
          subjectStruggles: [
            { subjectName: "Mathematics", strugglesCount: 62 },
            { subjectName: "Physical Sciences", strugglesCount: 45 }
          ]
        },
        {
          schoolName: "Shongwe Boarding School",
          region: "Nkomazi",
          averageAps: 27,
          readinessRate: 64,
          subjectStruggles: [
            { subjectName: "Mathematics", strugglesCount: 34 },
            { subjectName: "English First Additional", strugglesCount: 51 }
          ]
        },
        {
          schoolName: "Sikhulile High School",
          region: "Matsulu",
          averageAps: 22,
          readinessRate: 40,
          subjectStruggles: [
            { subjectName: "Mathematics", strugglesCount: 78 },
            { subjectName: "Physical Sciences", strugglesCount: 70 }
          ]
        },
        {
          schoolName: "Nkomazi High School",
          region: "Nkomazi, Tonga",
          averageAps: 21,
          readinessRate: 36,
          subjectStruggles: [
            { subjectName: "Mathematics", strugglesCount: 88 },
            { subjectName: "English First Additional", strugglesCount: 66 }
          ]
        },
        {
          schoolName: "Lydenburg High School",
          region: "Ehlanzeni, Lydenburg",
          averageAps: 29,
          readinessRate: 72,
          subjectStruggles: [
            { subjectName: "Physical Sciences", strugglesCount: 28 },
            { subjectName: "Mathematics", strugglesCount: 22 }
          ]
        }
      ];
      this.saveStore('schools', mockSchools);
    }

    if (this.getStore('mentors').length === 0) {
      const mockMentors = [
        {
          fullName: "Thabo Mokoena",
          email: "thabo.m@ump.ac.za",
          umpStudentId: "202214532",
          majorSubjects: ["Mathematics", "Physical Sciences"],
          adoptedLearnersCount: 1,
          impactScore: 120,
          badges: ["Gold Guardian", "Math Guru"]
        },
        {
          fullName: "Zinhle Ndlovu",
          email: "zinhle.n@ump.ac.za",
          umpStudentId: "202319028",
          majorSubjects: ["English First Additional", "Life Sciences"],
          adoptedLearnersCount: 2,
          impactScore: 180,
          badges: ["Community Champion", "Rising Star"]
        },
        {
          fullName: "Sipho Khumalo",
          email: "sipho.k@ump.ac.za",
          umpStudentId: "202100984",
          majorSubjects: ["Mathematics", "Accounting"],
          adoptedLearnersCount: 0,
          impactScore: 0,
          badges: []
        },
        {
          fullName: "Ntombi Shabangu",
          email: "ntombi.s@ump.ac.za",
          umpStudentId: "202417890",
          majorSubjects: ["Life Sciences", "Geography"],
          adoptedLearnersCount: 3,
          impactScore: 260,
          badges: ["Elite Guardian", "Community Champion", "Consistent Hero"]
        },
        {
          fullName: "Lebo Mahlangu",
          email: "lebo.m@ump.ac.za",
          umpStudentId: "202311240",
          majorSubjects: ["Business Studies", "Economics", "Accounting"],
          adoptedLearnersCount: 1,
          impactScore: 90,
          badges: ["Commerce Coach"]
        },
        {
          fullName: "Ayanda Nkosi",
          email: "ayanda.n@ump.ac.za",
          umpStudentId: "202218765",
          majorSubjects: ["Information Technology", "Mathematics"],
          adoptedLearnersCount: 2,
          impactScore: 210,
          badges: ["Tech Mentor", "Rising Star"]
        }
      ];
      this.saveStore('mentors', mockMentors);
    }

    if (this.getStore('learners').length === 0) {
      const mockLearners = [
        {
          fullName: "Lerato Cele",
          email: "lerato.c@gmail.com",
          province: "Mpumalanga",
          apsScore: 23,
          subjects: [
            { name: "Mathematics", mark: 45 },
            { name: "Physical Sciences", mark: 42 },
            { name: "Life Sciences", mark: 56 },
            { name: "English First Additional", mark: 65 },
            { name: "isiZulu Home Language", mark: 70 },
            { name: "Life Orientation", mark: 80 },
            { name: "Geography", mark: 52 }
          ],
          careerInterests: ["BSc Agriculture", "Diploma in IT"],
          academicRisk: "Medium",
          successProbability: 58,
          isAdopted: true,
          adoptedBy: "Thabo Mokoena"
        },
        {
          fullName: "Bandile Shongwe",
          email: "bandile.s@webmail.co.za",
          province: "Mpumalanga",
          apsScore: 31,
          subjects: [
            { name: "Mathematics", mark: 72 },
            { name: "Physical Sciences", mark: 68 },
            { name: "Life Sciences", mark: 75 },
            { name: "English First Additional", mark: 62 },
            { name: "Siswati Home Language", mark: 78 },
            { name: "Life Orientation", mark: 85 },
            { name: "Information Technology", mark: 81 }
          ],
          careerInterests: ["BSc Computer Science", "Bachelor of Engineering"],
          academicRisk: "Low",
          successProbability: 88,
          isAdopted: false,
          adoptedBy: null
        },
        {
          fullName: "Nomvula Dlamini",
          email: "nomvula.d@gmail.com",
          province: "Mpumalanga",
          apsScore: 19,
          subjects: [
            { name: "Mathematical Literacy", mark: 55 },
            { name: "Life Sciences", mark: 50 },
            { name: "History", mark: 62 },
            { name: "English First Additional", mark: 48 },
            { name: "Xitsonga Home Language", mark: 71 },
            { name: "Life Orientation", mark: 78 },
            { name: "Tourism", mark: 64 }
          ],
          careerInterests: ["Diploma in Hospitality Management", "Bachelor of Social Work"],
          academicRisk: "High",
          successProbability: 45,
          isAdopted: true,
          adoptedBy: "Zinhle Ndlovu"
        },
        {
          fullName: "Siphamandla Bhembe",
          email: "siphambhe@yahoo.com",
          province: "Mpumalanga",
          apsScore: 28,
          subjects: [
            { name: "Mathematics", mark: 61 },
            { name: "Physical Sciences", mark: 58 },
            { name: "Life Sciences", mark: 66 },
            { name: "English First Additional", mark: 60 },
            { name: "Siswati Home Language", mark: 74 },
            { name: "Life Orientation", mark: 82 },
            { name: "Geography", mark: 63 }
          ],
          careerInterests: ["BSc Agriculture", "BSc Environmental Science"],
          academicRisk: "Low",
          successProbability: 76,
          isAdopted: true,
          adoptedBy: "Ntombi Shabangu"
        },
        {
          fullName: "Precious Mahlangu",
          email: "precious.m@gmail.com",
          province: "Mpumalanga",
          apsScore: 25,
          subjects: [
            { name: "Mathematics", mark: 52 },
            { name: "Accounting", mark: 68 },
            { name: "Business Studies", mark: 72 },
            { name: "English First Additional", mark: 63 },
            { name: "Sepedi Home Language", mark: 76 },
            { name: "Life Orientation", mark: 81 },
            { name: "Economics", mark: 60 }
          ],
          careerInterests: ["Bachelor of Development Studies", "Diploma in Business Management"],
          academicRisk: "Medium",
          successProbability: 65,
          isAdopted: false,
          adoptedBy: null
        },
        {
          fullName: "Thandeka Zwane",
          email: "thandeka.z@webmail.co.za",
          province: "Mpumalanga",
          apsScore: 33,
          subjects: [
            { name: "Mathematics", mark: 78 },
            { name: "Physical Sciences", mark: 72 },
            { name: "Life Sciences", mark: 80 },
            { name: "English Home Language", mark: 71 },
            { name: "Siswati Home Language", mark: 82 },
            { name: "Life Orientation", mark: 88 },
            { name: "Geography", mark: 74 }
          ],
          careerInterests: ["BSc Nursing", "BSc Computer Science"],
          academicRisk: "Low",
          successProbability: 94,
          isAdopted: true,
          adoptedBy: "Ntombi Shabangu"
        }
      ];
      this.saveStore('learners', mockLearners);
    }
  }
}

export const db = new LocalMongoDatabase();
db.seedIfEmpty();
export default db;
