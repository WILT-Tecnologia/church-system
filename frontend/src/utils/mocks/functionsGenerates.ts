import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";

class FunctionsGenerates {
  generateChurchData = () => {
    const churchNames = [
      "Catedral de São Pedro",
      "Igreja Nossa Senhora Aparecida",
      "Igreja Batista da Esperança",
      "Igreja Presbiteriana Central",
      "Igreja Metodista Renovada",
      "Comunidade Cristã Vida Nova",
      "Paróquia Santo Antônio",
      "Catedral de São Paulo",
      "Igreja do Evangelho Pleno",
      "Igreja de Cristo",
    ];

    const emails = [
      "contato@saopedro.com",
      "contato@nossaaparecida.com",
      "contato@batistaesperanca.com",
      "contato@presbiterianacentral.com",
      "contato@metodistarenovada.com",
      "contato@vidanova.com",
      "contato@santoantonio.com",
      "contato@saopaulo.com",
      "contato@evangelhopleno.com",
      "contato@decristo.com",
    ];

    const cnpjs = [
      "12.345.678/0001-90",
      "23.456.789/0001-01",
      "34.567.890/0001-12",
      "45.678.901/0001-23",
      "56.789.012/0001-34",
      "67.890.123/0001-45",
      "78.901.234/0001-56",
      "89.012.345/0001-67",
      "90.123.456/0001-78",
      "01.234.567/0001-89",
    ];

    const ceps = [
      "01000-000",
      "02000-000",
      "03000-000",
      "04000-000",
      "05000-000",
      "06000-000",
      "07000-000",
      "08000-000",
      "09000-000",
      "10000-000",
    ];

    const streets = [
      "Rua da Fé",
      "Avenida das Flores",
      "Praça da Paz",
      "Rua dos Milagres",
      "Alameda das Graças",
      "Travessa do Amor",
      "Rua da Esperança",
      "Avenida da Luz",
      "Praça da Salvação",
      "Rua da Vida",
    ];

    const districts = [
      "Centro",
      "Jardim",
      "Alto",
      "Baixo",
      "Leste",
      "Oeste",
      "Norte",
      "Sul",
      "Vila Nova",
      "Vila Velha",
    ];

    const cities = [
      "São Paulo",
      "Rio de Janeiro",
      "Belo Horizonte",
      "Curitiba",
      "Porto Alegre",
      "Brasília",
      "Salvador",
      "Fortaleza",
      "Recife",
      "Manaus",
    ];

    const states = ["SP", "RJ", "MG", "PR", "RS", "DF", "BA", "CE", "PE", "AM"];

    const colors = [
      "#ff0000",
      "#00ff00",
      "#0000ff",
      "#ffff00",
      "#ff00ff",
      "#00ffff",
      "#000000",
      "#ffffff",
      "#ff6600",
      "#0066ff",
    ];

    const logos = [
      "logo1.png",
      "logo2.png",
      "logo3.png",
      "logo4.png",
      "logo5.png",
      "logo6.png",
      "logo7.png",
      "logo8.png",
      "logo9.png",
      "logo10.png",
    ];

    const favicons = [
      "favicon1.ico",
      "favicon2.ico",
      "favicon3.ico",
      "favicon4.ico",
      "favicon5.ico",
      "favicon6.ico",
      "favicon7.ico",
      "favicon8.ico",
      "favicon9.ico",
      "favicon10.ico",
    ];

    const backgrounds = [
      "background1.jpg",
      "background2.jpg",
      "background3.jpg",
      "background4.jpg",
      "background5.jpg",
      "background6.jpg",
      "background7.jpg",
      "background8.jpg",
      "background9.jpg",
      "background10.jpg",
    ];

    const churches = Array.from({ length: 10 }, (_, index) => ({
      id: uuidv4(),
      responsible_id: uuidv4(),
      name: churchNames[index],
      email: emails[index],
      cnpj: cnpjs[index],
      cep: ceps[index],
      street: streets[index],
      number: (Math.floor(Math.random() * 1000) + 1).toString(),
      complement: null,
      district: districts[index],
      city: cities[index],
      state: states[index],
      country: "Brasil",
      logo: logos[index],
      favicon: favicons[index],
      background: backgrounds[index],
      color: colors[index],
      created_at: dayjs(new Date()).format("DD-MM-YYYY [às] HH:mm:ss"),
      updated_at: dayjs(new Date()).format("DD-MM-YYYY [às] HH:mm:ss"),
    }));

    return churches;
  };

  generateOfficesData = () => {
    const officeNames = [
      "Administrative Office",
      "Regional Office - West",
      "Sales Office",
      "Customer Service Office",
      "Human Resources Office",
      "Finance Office",
      "Marketing Office",
      "IT Office",
      "Legal Office",
      "Research and Development Office",
      "Procurement Office",
      "Logistics Office",
    ];

    const descriptions = [
      "Main administrative office",
      "Regional office in the west",
      "Sales department office",
      "Customer service and support office",
      "Human resources and personnel management office",
      "Finance and accounting office",
      "Marketing and advertising office",
      "Information technology office",
      "Legal and compliance office",
      "Research and development office",
      "Procurement and supply chain office",
      "Logistics and transportation office",
    ];

    const offices = Array.from({ length: 10 }, (_, index) => ({
      id: uuidv4(),
      name: officeNames[index],
      description: descriptions[index],
      status: Math.random() < 0.5,
      created_at: dayjs(new Date()).format("DD-MM-YYYY [às] HH:mm:ss"),
      updated_at: dayjs(new Date()).format("DD-MM-YYYY [às] HH:mm:ss"),
    }));

    return offices;
  };

  generateChurchEvents = () => {
    const eventNames = [
      "Sunday Service",
      "Bible Study",
      "Youth Meeting",
      "Prayer Meeting",
      "Choir Practice",
      "Outreach Program",
      "Fundraising Event",
      "Baptism Ceremony",
      "Marriage Ceremony",
      "Funeral Service",
    ];

    const descriptions = [
      "Regular Sunday worship service.",
      "Weekly Bible study sessions.",
      "Monthly youth meetings and activities.",
      "Weekly prayer meetings.",
      "Weekly choir practice sessions.",
      "Monthly community outreach programs.",
      "Annual fundraising events for the church.",
      "Quarterly baptism ceremonies.",
      "Marriage ceremonies conducted by the church.",
      "Funeral services and memorials conducted by the church.",
    ];

    const events = Array.from({ length: 10 }, (_, index) => ({
      id: uuidv4(),
      church_id: uuidv4(),
      name: eventNames[index],
      description: descriptions[index],
      status: Math.random() < 0.5,
      created_at: dayjs(new Date()).format("DD-MM-YYYY [às] HH:mm:ss"),
      updated_at: dayjs(new Date()).format("DD-MM-YYYY [às] HH:mm:ss"),
    }));

    return events;
  };

  generateRandomUserProfiles = (numProfiles = 10) => {
    const profiles = [
      "Admin",
      "Editor",
      "Viewer",
      "Contributor",
      "Manager",
      "Supervisor",
      "Coordinator",
      "Support",
      "Guest",
      "Developer",
    ];

    return profiles.map((name, index) => ({
      id: (index + 1).toString(), // IDs como string
      user_id: `user_${index + 1}`, // IDs de usuário como string
      name: name,
      description: `${name} profile`,
      status: Math.random() < 0.5,
      created_at: dayjs().format("DD/MM/YYYY [às] HH:mm:ss"),
      updated_at: dayjs().format("DD/MM/YYYY [às] HH:mm:ss"),
    }));
  };

  generateRandomProfile = () => {
    const randomIndex = Math.floor(
      Math.random() * this.generateRandomUserProfiles().length
    );
    return this.generateRandomUserProfiles(randomIndex);
  };

  generateRandomPassword = (length = 8) => {
    const upperCaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowerCaseChars = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const specialChars = "!@#$%^&*()-_=+[]{}|;:,.<>?";

    const allChars = upperCaseChars + lowerCaseChars + numbers + specialChars;
    let password = "";

    // Adiciona pelo menos um caractere de cada tipo
    password +=
      upperCaseChars[Math.floor(Math.random() * upperCaseChars.length)];
    password +=
      lowerCaseChars[Math.floor(Math.random() * lowerCaseChars.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += specialChars[Math.floor(Math.random() * specialChars.length)];

    // Adiciona caracteres aleatórios até o comprimento desejado
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Embaralha a senha para garantir uma distribuição aleatória
    password = password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");

    return password;
  };

  generateUser = () => {
    const firstNames = [
      "Ana",
      "Bruno",
      "Carlos",
      "Daniel",
      "Eduarda",
      "Fernanda",
      "Gabriel",
      "Helena",
      "Igor",
      "Juliana",
      "Karla",
      "Lucas",
      "Mariana",
      "Nicolas",
      "Olga",
      "Pedro",
      "Quiteria",
      "Rafael",
      "Sofia",
      "Tatiane",
      "Ulysses",
      "Vanessa",
      "William",
      "Yara",
      "Zuleica",
    ];

    const lastNames = [
      "Silva",
      "Santos",
      "Oliveira",
      "Costa",
      "Pereira",
      "Lima",
      "Souza",
      "Almeida",
      "Martins",
      "Rodrigues",
      "Gonçalves",
      "Ferreira",
      "Mendes",
      "Barbosa",
      "Azevedo",
      "Carvalho",
      "Monteiro",
      "Gomes",
      "Nascimento",
      "Ribeiro",
      "Brandão",
      "Campos",
      "Pinto",
    ];

    const randomProfile = this.generateRandomProfile();
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    return {
      id: uuidv4(),
      login: `${firstName} ${lastName}`,
      password: this.generateRandomPassword(),
      change_password: Math.random() < 0.5,
      status: Math.random() < 0.5,
      profile: randomProfile[0].name,
      is_view_admin: Math.random() < 0.5,
      created_at: dayjs(new Date()).format("DD-MM-YYYY [às] HH:mm:ss"),
      updated_at: dayjs(new Date()).format("DD-MM-YYYY [às] HH:mm:ss"),
    };
  };

  generateRandomPermissions = (numPermissions = 10) => {
    const types = ["CREATE", "READ", "UPDATE", "DELETE"];
    const permissions = [];

    for (let i = 0; i < numPermissions; i++) {
      permissions.push({
        id: uuidv4(),
        profile_id: uuidv4(),
        name: `Permission ${i + 1}`,
        type: types[Math.floor(Math.random() * types.length)],
        created_at: dayjs().format("YYYY-MM-DDTHH:mm:ss[Z]"),
        updated_at: dayjs().format("YYYY-MM-DDTHH:mm:ss[Z]"),
      });
    }

    return permissions;
  };

  generateRandomProfilePermissions = (numAssociations = 10) => {
    const associations = [];

    for (let i = 0; i < numAssociations; i++) {
      associations.push({
        id: (i + 1).toString(), // IDs como string
        profile_id: (i + 1).toString(), // IDs de perfil como string
        permission_id: (i + 1).toString(), // IDs de permissões como string
        created_at: dayjs().format("YYYY-MM-DDTHH:mm:ss[Z]"),
        updated_at: dayjs().format("YYYY-MM-DDTHH:mm:ss[Z]"),
      });
    }

    return associations;
  };

  generateRandomPerson = () => {
    const generateRandomName = (): string => {
      const names = [
        "John Doe",
        "Jane Smith",
        "Alice Johnson",
        "Bob Brown",
        "Charlie Davis",
      ];
      return names[Math.floor(Math.random() * names.length)];
    };

    // Função para gerar um CPF aleatório (opcional)
    const generateRandomCPF = (): string => {
      return `${Math.floor(Math.random() * 999) + 1}.${Math.floor(Math.random() * 999) + 1}.${Math.floor(Math.random() * 999) + 1}-${Math.floor(Math.random() * 90) + 10}`;
    };

    // Função para gerar um telefone aleatório (opcional)
    const generateRandomPhone = (): string => {
      return `(${Math.floor(Math.random() * 90) + 10}) ${Math.floor(Math.random() * 900000000) + 100000000}`;
    };

    // Função para gerar dados aleatórios
    const generateRandomData = (count: number) => {
      const data = [];

      for (let i = 0; i < count; i++) {
        data.push({
          id: uuidv4(),
          user_id: uuidv4(),
          image: `image_${i}.png`,
          name: generateRandomName(),
          cpf: generateRandomCPF(),
          birth_date: dayjs()
            .subtract(Math.floor(Math.random() * 50), "years")
            .format("DD/MM/YYYY"),
          email: `user${i}@example.com`,
          phone_one: generateRandomPhone(),
          phone_two: generateRandomPhone(),
          sex: Math.random() > 0.5 ? "M" : "F",
          cep: `${Math.floor(Math.random() * 90000) + 10000}-${Math.floor(Math.random() * 90) + 10}`,
          street: `Street ${i}`,
          number: `${Math.floor(Math.random() * 1000)}`,
          district: `District ${i}`,
          complement: `Complement ${i}`,
          city: `City ${i}`,
          state: `ST`,
          country: `Country ${i}`,
          created_at: dayjs().format("DD/MM/YYYY [às] HH:mm:ss"),
          updated_at: dayjs().format("DD/MM/YYYY [às] HH:mm:ss"),
        });
      }

      return data;
    };

    return generateRandomData(10);
  };
}

export const functions = new FunctionsGenerates();
