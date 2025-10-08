
export async function handleApiError(response: Response): Promise<Error> {
    try {
        const errorData = await response.json();
        const errorMessage = errorData.detail || errorData.message || `خطای HTTP! کد وضعیت: ${response.status}`;
        return new Error(errorMessage);
    } catch {
        return new Error(`خطای HTTP! کد وضعیت: ${response.status}`);
    }
}
