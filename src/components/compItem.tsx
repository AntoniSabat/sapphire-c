import {Link} from "react-router-dom";
import {IoClose} from "react-icons/io5";
import {PAGE_PATH} from "../Utils/env.ts";
import {useKindeAuth} from "@kinde-oss/kinde-auth-react";
import {useEffect, useState} from "react";

const CompItem = ({comp, remove}) => {
    const {isAuthenticated, getPermission} = useKindeAuth();
    const [admin, setAdmin] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            const admin = getPermission('admin').isGranted;
            if (admin) {
                setAdmin(true);
            }
        }
    }, [isAuthenticated]);

    return (
        <div>
            <Link to={`${PAGE_PATH}/comps/${comp._id}`}>
                {comp.name} {comp.date} {comp.place}
            </Link>
            {admin && <button onClick={() => remove(comp._id)}><IoClose color={'crimson'}/></button>}
        </div>
    );
};

export default CompItem;
