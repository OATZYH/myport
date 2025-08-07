import { Icons } from "@/components/icons";
import { HomeIcon, NotebookIcon } from "lucide-react";

export const DATA = {
  name: "Sarun Khumthai",
  initials: "SR",
  url: "https://dillion.io",
  location: "Bangkok, Thailand",
  locationLink: "https://www.google.com/maps/place/sanfrancisco",
  description:
    "Software Engineer turned Entrepreneur. I love building things and helping people.",
  summary:
    "I'm a fast learner with strong skills in both frontend and backend (Fullstack) development. I’m always picking up new tools and tech, which helps me dive into projects quickly. Known for being a reliable team player, I take ownership of my work and enjoy collaborating to drive results. I thrive on tackling new challenges and continuously building my skill set.",
  avatarUrl: "/profiles-square-zoom.jpg",
  skills: [
    {
      name: "React",
      logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
    },
    {
      name: "Next.js",
      logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg",
    },
    {
      name: "JavaScript",
      logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
    },
    {
      name: "TypeScript",
      logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
    },
    {
      name: "Node.js",
      logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
    },
    {
      name: "Express",
      logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg",
    },
    {
      name: "NestJs",
      logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nestjs/nestjs-original.svg",
    },
    {
      name: "PHP",
      logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg",
    },
    {
      name: "Python",
      logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
    },
    {
      name: "Go",
      logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg",
    },
    {
      name: "Flutter",
      logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg",
    },
    {
      name: "MySQL",
      logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",
    },
    {
      name: "Postgres",
      logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
    },
    {
      name: "MongoDB",
      logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg",
    },
    {
      name: "Docker",
      logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
    },
    {
      name: "TailwindCSS",
      logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg",
    }
  ],
  navbar: [
    { href: "/", icon: HomeIcon, label: "Home" },
    // { href: "/blog", icon: NotebookIcon, label: "Blog" },
    {
      href: "https://sarun-resume.tiiny.site",
      icon: NotebookIcon,
      label: "Resume",
    },
  ],
  contact: {
    email: "sarun.khumthai@gmail.com",
    tel: "+66 634124268",
    social: {
      GitHub: {
        name: "GitHub",
        url: "https://github.com/OATZYH",
        icon: Icons.github,

        navbar: true,
      },
      LinkedIn: {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/sarun-khumthai/",
        icon: Icons.linkedin,

        navbar: true,
      },
      X: {
        name: "X",
        url: "https://dub.sh/dillion-twitter",
        icon: Icons.x,

        navbar: false,
      },
      Youtube: {
        name: "Youtube",
        url: "https://dub.sh/dillion-youtube",
        icon: Icons.youtube,
        navbar: false,
      },
      email: {
        name: "Send Email",
        url: "#contact",
        icon: Icons.email,

        navbar: true,
      },
    },
  },

  work: [
    {
      company: "Skinzync",
      href: "https://atomic.finance",
      badges: [],
      location: "Remote",
      title: "Software Engineer",
      logoUrl: "/skinzync (750 x 750 px).png",
      start: "Aug 2024",
      end: "Present",
      description:
        "Full-stack development of the Skinzync platform, managing both frontend and backend integration. End-to-end product deployment and Infrastructure management.",
    },
  ],
  education: [
    {
      school: "King Mongkut's University of Technology Thonburi",
      href: "https://www.kmutt.ac.th/",
      degree: "Bachelor of Faculty of Computer Engineering",
      logoUrl: "/KMUTT_CI_Semi_Logo_normal-full.png",
      start: "2022",
      end: "2026",
    },
    {
      school: "Princess Chulabhorn Science High School Chiang Rai",
      href: "https://www.pcccr.ac.th/",
      degree: "High School",
      logoUrl: "/pcshscr-logo.png",
      start: "2016",
      end: "2022",
    },
  ],
  projects: [
    {
      title: "Skinzync Platform",
      href: "https://skinzync.com/",
      dates: "",
      active: true,
      description:
        "Developed and deployed a full-stack e-commerce website for the Skinzync platform, handling product catalog, user management, and order processing. Implemented backend with Express and PostgreSQL, using Prisma for efficient database management.",
      technologies: [
        "Next.js",
        "Typescript",
        "PostgreSQL",
        "Prisma",
        "TailwindCSS",
        "Stripe",
        "Shadcn UI",
        "Magic UI",
      ],
      links: [
        {
          type: "Website",
          href: "https://skinzync.com/",
          icon: <Icons.globe className="w-4 h-4" />,
        },
      ],
      image: "/logo-text-white.png",
      video: "",
    },
    {
      title: "Expense tracker",
      href: "https://github.com/OATZYH/expense-tracker",
      dates: "",
      active: false,
      description:
        "This expense tracker project efficiently manages income and expenses. It offers a responsive user interface and secure data handling, create CRUD operations with Prisma and PostgreSQL.",
      technologies: [
        "Next.js",
        "Javascript",
        "PostgreSQL",
        "Prisma",
        "TailwindCSS",
        "NextUI",
      ],
      links: [
        {
          type: "Source",
          href: "https://github.com/OATZYH/expense-tracker",
          icon: <Icons.github className="h-4 w-4" />,
        },
      ],
      image:
        "https://raw.githubusercontent.com/OATZYH/expense-tracker/master/public/github/Home.png",
      video: "",
    },
    {
      title: "Mobil Support",
      href: "https://github.com/WinRafaelx/Bootcathon_Application_Smuttee",
      dates: "June 2024 - July 2024",
      active: true,
      description:
        "This schedule platform integrates AI [Typhoon API] for car service appointments, problem consultations, and upcoming workshop tools, enhancing my frontend skills with React and daisyUI.",
      technologies: [
        "React",
        "Javascript",
        "Express",
        "MongoDB",
        "TailwindCSS",
        "DaisyUI",
      ],
      links: [
        {
          type: "Source",
          href: "https://github.com/WinRafaelx/Bootcathon_Application_Smuttee",
          icon: <Icons.github className="w-4 h-4" />,
        },
      ],
      image: "",
      video: "/MobilSupport.mp4",
    },
    {
      title: "Shorten URL",
      href: "https://shortsyn.netlify.app/",
      dates: "",
      active: true,
      description:
        "Develop a URL shortening system with React (frontend) and Node.js (backend) for creating and managing short links. Provide an intuitive interface and efficient link management for a seamless user experience.",
      technologies: [
        "React",
        "Typescript",
        "TailwindCSS",
        "NodeJS",
        "Express",
        "PostgreSQL",
      ],
      links: [
        {
          type: "Website",
          href: "https://shortsyn.netlify.app/",
          icon: <Icons.globe className="w-4 h-4" />,
        },
        {
          type: "Source",
          href: "https://github.com/OATZYH/Shorten-URL",
          icon: <Icons.github className="w-4 h-4" />,
        },
      ],
      image: "/shortenurl.png",
      video: "",
    },
    {
      title: "FundFlow",
      href: "https://github.com/tawayahc/FundFlow",
      dates: "",
      active: true,
      description:
        "FundFlow is a mobile application designed to simplify personal financial management by allowing users to record daily income and expenses. The app integrates Artificial Intelligence (AI) for analyzing mobile banking receipts and categorizing transactions, helping users to efficiently track and manage their finances.",
      technologies: [
        "Flutter",
        "Go",
        "FastAPI (Python)",
        "PostgreSQL",
      ],
      links: [
        {
          type: "Source",
          href: "https://github.com/tawayahc/FundFlow",
          icon: <Icons.github className="w-4 h-4" />,
        },
      ],
      image: "/FundFlow.png",
      video: "",
    }
  ],
  hackathons: [
    {
      title: "ExxonMobil IT Bootcathon 2024",
      dates: "June 2024 - July 2024",
      location: "Bangkok, Thailand",
      description:
        "We got runner up in the ExxonMobil IT Bootcathon 2024. We have opputunity to learn how corporation using Auzure DevOps and how to work in a team.",
      image: "/Exxon_Mobil_Logo.svg",
      links: [
        {
          title: "Github",
          icon: <Icons.github className="h-4 w-4" />,
          href: "https://github.com/WinRafaelx/Bootcathon_Application_Smuttee",
        },
      ],
    },
    {
      title: "Microsoft AI for Accessibility Hackathon 2023",
      dates: "November 2024",
      location: "Bangkok, Thailand",
      description:
        "We got 2nd place in this hackathon. We have opputunity to learn how to use AI to help people with disabilities. We have a chance to contact with FOUNDATION FOR THE BLIND IN THAILAND UNDER THE ROYAL PATRONAGE OF H.M. THE QUEEN to do some research.",
      image: "/microsoft-logo-png.png",
      links: [],
    },
    {
      title: "Digital Innovation Sandbox",
      dates: "November 2024",
      location: "Bangkok, Thailand",
      description:
        "I have opportunity to learn from the expert in the field of digital innovation. And How I bulid a startup from scratch. We have a chance to pitch our idea to the investor and got a runner up.",
      image: "/DIS_logo.jpg",
      links: [],
    },
    {
      title: "Hackaday 2023 - CityHack",
      dates: "November 25th - 26th, 2023",
      location: "Bangkok, Thailand",
      description:
        "Hosted by Sirisoft and KMUTT, this hackathon challenged participants to create web applications focused on improving urban life in three areas: Education, Sustainability, and Infrastructure. Bangkok's Governor, Chadchart Sittipunt, presented awards to the winners.",
      image: "/sirisoft.png",
      links: [
        {
          title: "Github",
          icon: <Icons.github className="h-4 w-4" />,
          href: "https://github.com/Narutchai01/sirisoft-hackathon",
        },
      ],
    },
    {
      title: "Huawei Developer Competition APAC 2023",
      dates: "August - October 2023",
      location: "Bangkok, Thailand",
      description:
        "Top 50 Finalist in the Huawei Developer Competition APAC 2023. We have opportunity to learn how to use Huawei Cloud and how to use it in our project.",
      image: "/Huawei_Standard_logo.png",
      links: [],
    },
  ],
} as const;
