
// User Profile Component
import {useAuth} from "../hooks/AuthenticationContext.jsx";

export const UserProfile = () => {
    const { user, logout } = useAuth()

    if (!user) {
        return null
    }

    return (
        <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center space-x-4">
                {user.picture ? (
                    <img
                        src={user.picture}
                        alt={user.name}
                        className="w-16 h-16 rounded-full"
                    />
                ) : (
                    <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 text-xl font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                )}
                <div>
                    <h3 className="text-lg font-semibold">{user.name}</h3>
                    <p className="text-gray-600">{user.email}</p>
                    <p className="text-sm text-gray-500">
                        Signed in with {user.auth_provider === 'google' ? 'Google' : 'Email'}
                    </p>
                </div>
            </div>

            <button
                onClick={logout}
                className="mt-6 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
                Sign Out
            </button>
        </div>
    )
}
