import './HomePage.scss';
import Menu from "../../components/utils/Menu.tsx";
import {Avatar, Button, Timeline} from "flowbite-react";
import {customTheme} from "../../Utils/theme.ts";
import CountUp from "react-countup";
import {useState} from "react";
import ScrollTrigger from "react-scroll-trigger";
import ubranie from "../../assets/images/ubranie.png";
import plakat from '../../assets/images/plakat.png';
import icon from '../../assets/images/icon.png';
import makeup from "../../assets/images/makijaż.png";
import hair from "../../assets/images/fryzura.png";
import man from "../../assets/images/man.png";
import {Link} from "react-router-dom";
import {PAGE_PATH} from "../../Utils/env.ts";
import {HiArrowNarrowRight} from "react-icons/hi";
import {HiCalendar} from "react-icons/hi2";
import Footer1 from "../../components/utils/Footer1.tsx";

const results = [
    {
        ammount: 15,
        text: 'pracowników',
        plus: false,
    },
    {
        ammount: 1700,
        text: 'obserwujących ig',
        plus: true
    },
    {
        ammount: 200,
        text: 'turniejów',
        plus: true
    },
    {
        ammount: 3000,
        text: 'zadowolonych klientów',
        plus: true
    }
]

const HomePage = () => {
    const [counterOn, setCounterOn] = useState(false);

    return (
        <div className={'relative pb-[65px] min-h-[100vh] overflow-x-hidden'}>
            <Menu/>
            <div className={'min-h-[100vh] pb-[50px] h-fit relative'}>
                <div className={'flex flex-col justify-center items-center'}>
                    <h1 className={'font-extrabold text-center text-[50px] md:absolute md:top-[12%] md:left-[6%] lg:top-[20%] xl:top-[12%]'}>Witamy!</h1>
                    <h1 className={'font-extrabold text-[50px] text-center text-primary md:absolute md:top-[20%] md:left-[6%] lg:top-[28%] xl:top-[20%]'}>Sapphire
                        Studio</h1>

                    <p className={'text-justify px-8 mt-5 md:absolute md:top-[35%] md:left-[6%] md:text-left md:px-0 md:w-[34.5%] lg:top-[43%] xl:top-[35%]'}>
                        Jesteśmy zespołem stylistów Sapphire Studio, który zadba o to, abyś wyglądał/-ła jak najlepiej
                        na
                        parkiecie 🤩
                        Zawsze dbamy o twoją wyjątkowość💎✨ Pomożemy w doborze stylizacji, spełniając wszystkie Twoje
                        preferencje!
                    </p>

                    <div
                        className={'flex items-center justify-center mt-10 bg-primary rounded-[50%] w-[80vw] h-[80vw] sm:w-[70vw] sm:h-[70vw] md:w-[65vw] md:h-[65vw] lg:w-[55vw] lg:h-[55vw] xl:w-[53vw] xl:h-[53vw] md:absolute md:right-[-10vw] md:bottom-[7%] lg:right-[-10vw] lg:bottom-[7%] xl:right-[-10vw] xl:bottom-[7%]'}>
                        <div className="circleImg rounded-[50%] w-full h-full"></div>

                        <div
                            className="stripsBox absolute left-[-1000%] lg:w-[400px] md:left-[-1000%] xl:h-[160px] xl:w-[500px] xl:left-[-320px] lg:h-[150px] lg:top-[9%] lg:left-[-220px] w-[450px] h-[200px] top-[15%] z-[-1] flex flex-col">
                            <div className="w-full flex justify-between grow">
                                <div className={'radius bg-primary w-[20%]'}></div>
                                <div className={'radius bg-primary w-[70%]'}></div>
                            </div>
                            <div className="w-full grow radius"></div>
                            <div className="mx-[55%] w-1/2 grow radius bg-primary"></div>
                        </div>
                    </div>

                    <Button className={'mt-10 md:absolute md:top-[68%] md:left-[6%] xl:top-[55%]'}
                            theme={customTheme.button} color={'secondary'}>
                        <a href={'#result'}>Zobacz więcej!</a>
                    </Button>
                </div>
            </div>

            <div id={'result'} className={'grid grid-cols-2 container mx-auto lg:grid-cols-4 place-items-center'}>
                {results.map((result, index) => (
                    <div key={index} className={`flex flex-col items-center`}>
                        <ScrollTrigger onEnter={() => setCounterOn(true)} onExit={() => setCounterOn(false)}>
                            {counterOn &&
                                <h1 className={'font-bold text-[50px]'}>
                                    <CountUp end={result.ammount} duration={2} delay={0}/>{result.plus && '+'}
                                </h1>
                            }
                        </ScrollTrigger>
                        <p className={'small-caps text-xl text-stone-700 font-light'}>{result.text}</p>
                    </div>
                ))}
            </div>

            <div className="min-h-[100vh] flex flex-col-reverse md:flex-row mt-[100px] md:bg-zinc-100">
                <div
                    className={'w-full flex flex-col gap-10 justify-center pl-16 pr-16 md:pl-32 md:pr-10 md:w-1/2 md:mt-[-50px]'}>
                    <div className={'w-[70px] h-[70px] rounded-[50%] flex items-center justify-center'}>
                        <img className={'w-[40px]'} src={icon} alt=""/>
                    </div>

                    <div className={'flex flex-col gap-3'}>
                        <h2 className={'text-[40px] font-bold'}>Nasze usługi</h2>
                        <p className={'text-[18px] font-light'}>Jesteśmy stworzeni po to abyś wyglądał/-a olśniewająco w
                            każdych parkietowych warunkach. Skupiamy się na dwóch aspektach Twojego turniejowego
                            Look'u</p>
                    </div>
                    <div className={'flex flex-col items-center'}>
                        <p className={'flex items-center'}>
                            <img className={'w-1/6 mix-blend-color-burn'} src={makeup} alt={''}/>
                            Makijaże
                        </p>
                        <p className={'flex items-center'}>
                            <img className={'w-1/6 mix-blend-color-burn'} src={hair} alt={''}/>
                            Fryzury
                        </p>
                        <p className={'flex items-center'}>
                            <img className={'w-1/6 mix-blend-color-burn'} src={man} alt={''}/>
                            Męskie makijaże i fryzury
                        </p>
                    </div>

                    <Button className={'w-fit'} theme={customTheme.button} color={'secondary'}>
                        <Link to={`${PAGE_PATH}/treatments`}>Zobacz usługi</Link>
                    </Button>
                </div>

                <div className={'flex flex-col justify-center items-center w-full md:w-1/2'}>
                    <img loading={'lazy'} className={'h-[350px] translate-x-[25%] rounded-xl shadow-2xl'} src={plakat} alt=""/>
                    <img loading={'lazy'} className={'h-[350px] translate-x-[-25%] translate-y-[-15%] rounded-xl shadow-2xl'}
                         src={ubranie} alt=""/>
                </div>
            </div>

            <div className={'container mx-auto mt-[50px] px-10'}>
                <div className={'mb-5'}>
                    <h1 className="text-center text-3xl font-bold mt-10">O nas!</h1>
                    <p className="text-center text-md mt-2">Poznaj naszą historię..</p>
                </div>
                <Timeline>
                    <Timeline.Item>
                        <Timeline.Point color={''} icon={HiCalendar}/>
                        <Timeline.Content>
                            <Timeline.Time>Obecnie</Timeline.Time>
                            <Timeline.Title>Rozwijamy się</Timeline.Title>
                            <Timeline.Body>
                                Get access to over 20+ pages including a dashboard layout, charts, kanban board, calendar, and pre-order
                                E-commerce & Marketing pages.
                            </Timeline.Body>
                        </Timeline.Content>
                    </Timeline.Item>
                    <Timeline.Item>
                        <Timeline.Point icon={HiCalendar} />
                        <Timeline.Content>
                            <Timeline.Time>2022</Timeline.Time>
                            <Timeline.Title>Tutaj coś tam będzie</Timeline.Title>
                            <Timeline.Body>
                                All of the pages and components are first designed in Figma and we keep a parity between the two versions
                                even as we update the project.
                            </Timeline.Body>
                            <Button color="gray">
                                Więcej info
                                <HiArrowNarrowRight className="ml-2 h-3 w-3" />
                            </Button>
                        </Timeline.Content>
                    </Timeline.Item>
                    <Timeline.Item>
                        <Timeline.Point icon={HiCalendar} />
                        <Timeline.Content>
                            <Timeline.Time>1991</Timeline.Time>
                            <Timeline.Title>Pierwszy turniej</Timeline.Title>
                            <Timeline.Body>
                                Get started with dozens of web components and interactive elements built on top of Tailwind CSS.
                            </Timeline.Body>
                        </Timeline.Content>
                    </Timeline.Item>
                    <Timeline.Item>
                        <Timeline.Point icon={HiCalendar} />
                        <Timeline.Content>
                            <Timeline.Time>Rok załozenia 1990</Timeline.Time>
                            <Timeline.Title>Powstanie Sapphire Studio</Timeline.Title>
                        </Timeline.Content>
                    </Timeline.Item>
                </Timeline>
            </div>

            <div className="gradient bg-secondary min-h-[100vh] w-full relative mt-10">
                {/*<div className={'absolute '}></div>*/}
                <div className={'mb-5'}>
                    <h1 className="text-center text-3xl font-bold mt-10 text-white">Poznaj nasz Team!</h1>
                </div>

                <div
                    className={'container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 items-center gap-12 justify-items-center mt-32'}>
                    <div className={'flex flex-col gap-5 items-center'}>
                        <Avatar img={''} size={'xl'} rounded/>
                        <h4 className={'text-lg font-bold text-white'}>Lena Shokola</h4>
                        <p className={'small-caps text-white mt-[-20px] text-lg'}>pracownik top</p>
                    </div>
                    <div className={'flex flex-col gap-5 items-center'}>
                        <Avatar img={''} size={'xl'} rounded/>
                        <h4 className={'text-lg font-bold text-white'}>Lena Shokola</h4>
                        <p className={'small-caps text-white mt-[-20px] text-lg'}>pracownik top</p>
                    </div>
                    <div className={'flex flex-col gap-5 items-center'}>
                        <Avatar img={''} size={'xl'} rounded/>
                        <h4 className={'text-lg font-bold text-white'}>Lena Shokola</h4>
                        <p className={'small-caps text-white mt-[-20px] text-lg'}>pracownik top</p>
                    </div>
                    <div className={'flex flex-col gap-5 items-center'}>
                        <Avatar img={''} size={'xl'} rounded/>
                        <h4 className={'text-lg font-bold text-white'}>Lena Shokola</h4>
                        <p className={'small-caps text-white mt-[-20px] text-lg'}>pracownik top</p>
                    </div>
                </div>

                <Button theme={customTheme.button} color={'primary'}
                        className={'absolute bottom-24 left-[50%] translate-x-[-50%]'}>
                    <Link to={`${PAGE_PATH}/employees`}>Zobacz wszystkich</Link>
                </Button>
            </div>

            <div className={'min-h-[130vh] test'}></div>
            <Footer1/>
        </div>
    );
};

export default HomePage;
