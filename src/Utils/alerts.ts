import Swal from "sweetalert2";

export const SuccessAlert = (title: string, text: string, callback?: () => void) => {
    Swal.fire({
        icon: 'success',
        title,
        text,
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false
    }).then(() => callback ? callback() : null);
}

export const ErrorAlert = (title: string, text: string) => {
    Swal.fire({
        icon: 'error',
        title,
        text
    })
}

export const ConfirmAlert = (title: string, text: string, callback: (result: any) => void) => {
    Swal.fire({
        icon: 'question',
        title,
        text,
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: `Tak`,
        denyButtonText: 'Nie',
        showCloseButton: true,
        cancelButtonText: 'Anuluj'
    }).then((result) => callback(result.isConfirmed))
}
