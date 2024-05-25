import {gql, request} from "graphql-request";
import {GRAPHQL_API} from "./env.ts";
import {Break} from "../models/Comp.model.ts";

const loadRecipes = async() => {
    const query = gql`
    query GetRecipes {
      getRecipes {
        name
        description
        thumbsUp
        thumbsDown
        createdAt
      }
    }`

    return await request('http://localhost:5005', query);
}

const loadComps = async() => {
    const query = gql`
        query {
          comps {
            _id
            name
            date
            place
            timeStart
            timeEnd
          }
        }`

    return await request(GRAPHQL_API, query);
}

const loadCompDetails = async(id: string) => {
    const query = gql`
        query {
          getCompDetails(id:"${id}") {
            _id
            name
            date
            place
            employees
            timeStart
            timeEnd
            breaks {
              breakStart
              breakLong
            }
            treatments {
              _id
              treatmentId
              timeStart
              timeEnd
            }
            reports {
                _id
                clientName
                clientSurname
                clientEmail
                clientPhoneNumber
                treatmentId
                compTreatmentId
                employeeId
                confirmed
            }
          }
        }`

    return await request(GRAPHQL_API, query);
}

const createComp = async(name: string, date: string, place: string, timeStart: string, timeEnd: string) => {
    const query = gql`
        mutation {
          createComp(createCompInput: {
            name: "${name}",
            date: "${date}",
            place: "${place}",
            timeStart: "${timeStart}",
            timeEnd: "${timeEnd}"
          }) {
            _id
            name
            date
            place
            timeStart
            timeEnd
          }
        }`

    return await request(GRAPHQL_API, query);
}

const editComp = async(id: string, name: string, date: string, place: string, timeStart: string, timeEnd: string, breaks: Break[], employees: string[]) => {
    const breaksInput = breaks.length ? breaks.map(b => ({ breakStart: b.breakStart, breakLong: b.breakLong })) : [];
    const employeesInput = employees.length > 0 ? `["${employees.join('", "')}"]` : '[]';

    const query = gql`
         mutation ($breaks: [BreakInput!]!) {
          editComp(id:"${id}", editCompInput: {
            name: "${name}",
            date: "${date}",
            place:"${place}",
            timeStart:"${timeStart}",
            timeEnd:"${timeEnd}",
            breaks: $breaks,
            employees: ${employeesInput},
          }) {
            _id
            name
            date
            place
            employees
            timeStart
            timeEnd
            breaks {
              breakStart
              breakLong
            }
            treatments {
              _id
              treatmentId
              timeStart
              timeEnd
            }
          }
        }
    `

    return await request(GRAPHQL_API, query, { breaks: breaksInput });
}


const removeComp = async(id: string) => {
    const query = gql`
    mutation {
      removeComp(id:"${id}") {
        _id
      }
    }`

    return await request(GRAPHQL_API, query);
}

const loadCompTreatments = async(id: string) => {
    const query = gql`
        query {
          getCompTreatments(id:"${id}") {
            _id
            treatmentId
            timeStart
            timeEnd
          }
        }
    `

    return await request(GRAPHQL_API, query);
}

const createCompTreatment = async(compId: string, treatmentId: string, timeStart: string, timeEnd: string) => {
    const query = gql`
        mutation {
          createCompTreatment(compId:"${compId}", createCompTreatmentInput: {
            treatmentId: "${treatmentId}",
            timeStart: "${timeStart}",
            timeEnd: "${timeEnd}"
          }) {
            _id
          }
        }
    `

    return await request(GRAPHQL_API, query);
}

const getCompTreatmentDetails = async(compId: string, compTreatmentId: string) => {
    const query = gql`
        query {
          getCompTreatmentDetails(compId: "${compId}", compTreatmentId: "${compTreatmentId}") {
            _id
            treatmentId
            timeStart
            timeEnd
          }
        }`

    return await request(GRAPHQL_API, query);
}

const editCompTreatment = async(compId: string, compTreatmentId: string, timeStart: string, timeEnd: string) => {
    const query = gql`
        mutation {
          editCompTreatment(compId:"${compId}", compTreatmentId: "${compTreatmentId}", editCompTreatmentInput: {
            timeStart: "${timeStart}",
            timeEnd: "${timeEnd}"
          }) {
            _id
            name
            date
            place
            employees
            timeStart
            timeEnd
            breaks {
              breakStart
              breakLong
            }
            treatments {
              _id
              treatmentId
              timeStart
              timeEnd
            }
            reports {
                _id
                clientName
                clientSurname
                clientEmail
                clientPhoneNumber
                treatmentId
                compTreatmentId
                employeeId
                confirmed
            }
          }
        }`

    return await request(GRAPHQL_API, query);
}

const editCompTreatments = async(compId: string, treatmentsIds: string[], timeDifference: string) => {
    const query = gql`
        mutation ($compId: String!, $treatmentsIds: [String!]!, $timeDifference: String!) {
          editCompTreatments(compId: $compId, compTreatmentsIds: $treatmentsIds, timeDifference: $timeDifference) {
            _id
            name
            date
            place
            employees
            timeStart
            timeEnd
            breaks {
              breakStart
              breakLong
            }
            treatments {
              _id
              treatmentId
              timeStart
              timeEnd
            }
            reports {
                _id
                clientName
                clientSurname
                clientEmail
                clientPhoneNumber
                treatmentId
                compTreatmentId
                employeeId
                confirmed
            }
          }
        }
    `;

    const variables = {
        compId: compId,
        treatmentsIds: treatmentsIds,
        timeDifference: timeDifference
    };

    return await request(GRAPHQL_API, query, variables);
};


const removeCompTreatment = async(compId: string, compTreatmentId: string) => {
    const query = gql`
    mutation {
      removeCompTreatment(compId:"${compId}", compTreatmentId: "${compTreatmentId}") {
        _id
        name
        date
        place
        employees
        timeStart
        timeEnd
        breaks {
          breakStart
          breakLong
        }
        treatments {
          _id
          treatmentId
          timeStart
          timeEnd
        }
        reports {
            _id
            clientName
            clientSurname
            clientEmail
            clientPhoneNumber
            treatmentId
            compTreatmentId
            employeeId
            confirmed
        }
      }
    }`

    return await request(GRAPHQL_API, query);
}

const createReport = async(compId: string, compTreatmentId: string, client: {name: string, surname: string, email: string, phoneNumber: string}, treatmentId: string, employeeId: string) => {
    const query = gql`
        mutation {
            createReport(compId: "${compId}", compTreatmentId:"${compTreatmentId}", createReport: {
                clientName: "${client.name}",
                clientSurname:"${client.surname}",
                clientEmail:"${client.email}",
                clientPhoneNumber:"${client.phoneNumber}",
                treatmentId: "${treatmentId}",
                compTreatmentId: "${compTreatmentId}",
                employeeId: "${employeeId}",
            }) {
                _id
                name
                date
                place
                employees
                timeStart
                timeEnd
                breaks {
                  breakStart
                  breakLong
                }
                treatments {
                  _id
                  treatmentId
                  timeStart
                  timeEnd
                }
                reports {
                    _id
                    clientName
                    clientSurname
                    clientEmail
                    clientPhoneNumber
                    treatmentId
                    compTreatmentId
                    employeeId
                    confirmed
                }
            }
        }
    `

    return await request(GRAPHQL_API, query);
}

const removeReportsAssignedToEmployee = async(compId: string, employeeId: string) => {
    const query = gql`
    mutation {
      removeReportsAssignedToEmployee(compId:"${compId}", employeeId:"${employeeId}") {
        _id
        name
        date
        place
        employees
        timeStart
        timeEnd
        breaks {
          breakStart
          breakLong
        }
        treatments {
          _id
          treatmentId
          timeStart
          timeEnd
        }
        reports {
            _id
            clientName
            clientSurname
            clientEmail
            clientPhoneNumber
            treatmentId
            compTreatmentId
            employeeId
            confirmed
        }
      }
    }`

    return await request(GRAPHQL_API, query);
}

const editReport = async(compId: string, reportId: string, treatmentId: string, compTreatmentId: string, employeeId: string, confirmed: boolean) => {
    const query = gql`
        mutation {
          editReport(compId: "${compId}", reportId: "${reportId}", editReport: {
            treatmentId: "${treatmentId}",
            compTreatmentId: "${compTreatmentId}",
            employeeId: "${employeeId}",
            confirmed: ${confirmed}
          }) {
            _id
            name
            date
            place
            employees
            timeStart
            timeEnd
            breaks {
              breakStart
              breakLong
            }
            treatments {
              _id
              treatmentId
              timeStart
              timeEnd
            }
            reports {
                _id
                clientName
                clientSurname
                clientEmail
                clientPhoneNumber
                treatmentId
                compTreatmentId
                employeeId
                confirmed
            }
          }
        }
    `

    return await request(GRAPHQL_API, query);
}

const removeReport = async(compId: string, reportId: string) => {
    const query = gql`
        mutation {
          removeReport(compId:"${compId}", reportId:"${reportId}") {
            _id
            name
            date
            place
            employees
            timeStart
            timeEnd
            breaks {
              breakStart
              breakLong
            }
            treatments {
              _id
              treatmentId
              timeStart
              timeEnd
            }
            reports {
                _id
                clientName
                clientSurname
                clientEmail
                clientPhoneNumber
                treatmentId
                compTreatmentId
                employeeId
                confirmed
            }
          }
        }
    `

    return await request(GRAPHQL_API, query);
}

const removeTreatmentFromComp = async(compId: string, treatmentId: string) => {
    const query= gql`
        mutation {
            removeTreatmentFromComp(compId: "${compId}", treatmentId: "${treatmentId}") {
                _id
                name
                date
                place
                employees
                timeStart
                timeEnd
                breaks {
                  breakStart
                  breakLong
                }
                treatments {
                  _id
                  treatmentId
                  timeStart
                  timeEnd
                }
                reports {
                    _id
                    clientName
                    clientSurname
                    clientEmail
                    clientPhoneNumber
                    treatmentId
                    compTreatmentId
                    employeeId
                    confirmed
                }
            }
        }
    `

    return await request(GRAPHQL_API, query);
}

const getCalendar = async(compId: string, date: string) => {
    const query = gql`
        mutation {
            getCalendar(compId:"${compId}", date: "${date}") {
                compId
                employeeId
                clientEmail
                clientName
                clientSurname
                id
                start
                end
                confirmed
            }
        }
    `

    return await request(GRAPHQL_API, query);
}

const loadTreatments = async() => {
    const query = gql`
        query {
          treatments {
            _id
            name
            description
            currency
            price
            time
            image
            tag
          }
        }
    `

    return await request(GRAPHQL_API, query);
}

const createTreatment = async (name: string, description: string, currency: string, price: number, time: string, tag: string) => {
    const query = gql`
        mutation {
          createTreatment(createTreatmentInput1:{
            name: "${name}",
            currency:"${currency}",
            price:${price},
            time:"${time}",
            tag: "${tag}",
            description: "${description}"
          }) {
            _id
            name
            description
            currency
            price
            time
            image
            tag
          }
        }`;

    return await request(GRAPHQL_API, query);
}

const removeTreatment = async(id: string) => {
    const query = gql`
    mutation {
      removeTreatment(id:"${id}") {
        _id
      }
    }`

    return await request(GRAPHQL_API, query);
}

const editTreatment = async(id: string, name: string, description: string, currency: string, price: number, time: string, image: string,  tag: string) => {
    const query = gql`
    mutation {
        editTreatment(id:"${id}", updateTreatmentInput: {
          name: "${name}",
          description:"${description}",
          currency: "${currency}",
          price:${price},
          time:"${time}",
          image:"${image}",
          tag: "${tag}"
        }) {
          _id
          name
          description
          currency
          price
          time
          image
          tag
      }
    }`

    return await request(GRAPHQL_API, query);
}

const loadTreatmentDetails = async(id: string) => {
    const query = gql`
    query {
      getTreatmentDetails(id:"${id}") {
         _id
        name
        description
        currency
        price
        time
        image
        tag
      }
    }`

    return await request(GRAPHQL_API, query);
}

const loadEmployees = async() => {
    const query = gql`
        query {
          employees {
            _id
            name
            surname
            description
            ig
            tag
            image
            treatmentsIds
          }
        }`

    return await request(GRAPHQL_API, query);
}

const loadEmployeeDetails = async(id: string) => {
    const query = gql`
        query {
          getEmployeeDetails(id:"${id}") {
             _id
            name
            surname
            description
            treatmentsIds
            ig
            tag
            image
            images
          }
        }`

    return await request(GRAPHQL_API, query);
}

const createEmployee = async(name: string, surname: string, description: string, treatmentsIds: string[], ig: string, tag: string) => {
    const treatmentsIdsInput = treatmentsIds.length > 0 ? `["${treatmentsIds.join('", "')}"]` : '[]';

    const query = gql`
        mutation {
          createEmployee(createEmployeeInput: {
            name:"${name}",
            surname:"${surname}",
            description:"${description}",
            treatmentsIds: ${treatmentsIdsInput},
            ig:"${ig}",
            tag:"${tag}"
          }) {
            _id
            name
            surname
            description
            ig
            image
            tag
          }
        }`

    return await request(GRAPHQL_API, query);
}

const editEmployee = async(id: string, name: string, surname: string, description: string, treatmentsIds: string[], ig: string, image: string, images: string[], tag: string) => {
    const treatmentsIdsInput = treatmentsIds.length > 0 ? `["${treatmentsIds.join('", "')}"]` : '[]';
    const imagesInput = images.length > 0 ? `["${images.join('", "')}"]` : '[]';

    const query = gql`
        mutation {
          editEmployee(id:"${id}", editEmployeeInput: {
            name: "${name}",
            surname: "${surname}",
            description: "${description}",
            treatmentsIds: ${treatmentsIdsInput},
            image: "${image}",
            ig: "${ig}",
            images: ${imagesInput},
            tag: "${tag}"
          }) {
            _id
            name
            surname
            description
            treatmentsIds
            ig
            image
            images
          }
        }`

    return await request(GRAPHQL_API, query);
}

const removeEmployee = async(id: string) => {
    const query = gql`
    mutation {
      removeEmployee(id:"${id}") {
        _id
      }
    }`

    return await request(GRAPHQL_API, query);
}

const loadGalleries = async() => {
    const query = gql`
        query {
          galleries {
            _id
            name
            images
          }
        }`

    return await request(GRAPHQL_API, query);
}

const createGallery = async(name: string, images: string[]) => {
    const imagesInput = images.length > 0 ? `["${images.join('", "')}"]` : '[]';

    const query = gql`
        mutation {
          createGallery(createGalleryInput: {
            name:"${name}",
            images: ${imagesInput}
          }) {
            _id
            name
            images
          }
        }`

    return await request(GRAPHQL_API, query);
}

const editGallery = async(id: string, name: string, images: string[]) => {
    const imagesInput = images.length > 0 ? `["${images.join('", "')}"]` : '[]';

    const query = gql`
        mutation {
          editGallery(id:"${id}", editGalleryInput: {
            name: "${name}",
            images: ${imagesInput},
          }) {
            _id
            name
            images
          }
        }`

    return await request(GRAPHQL_API, query);
}

const removeGallery = async(id: string) => {
    const query = gql`
        mutation {
            removeGallery(id:"${id}") {
                _id
            }
        }`

    return await request(GRAPHQL_API, query);
}

export default {
    loadRecipes,

    // comps
    loadComps,
    loadCompDetails,
    createComp,
    editComp,
    removeComp,

    // compTreatments
    loadCompTreatments,
    createCompTreatment,
    getCompTreatmentDetails,
    editCompTreatment,
    editCompTreatments,
    removeCompTreatment,
    removeTreatmentFromComp,

    //calendar
    getCalendar,

    // compReports
    createReport,
    removeReportsAssignedToEmployee,
    editReport,
    removeReport,

    //treatments
    loadTreatments,
    loadTreatmentDetails,
    createTreatment,
    editTreatment,
    removeTreatment,

    //employees
    loadEmployees,
    loadEmployeeDetails,
    createEmployee,
    editEmployee,
    removeEmployee,

    //gallery
    loadGalleries,
    createGallery,
    editGallery,
    removeGallery
}
