// src/components/UI/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // Recibe onRemove del padre
  handleRemove = () => {
    this.props.onRemove?.(); // Ejecuta la función para eliminar
    this.setState({ hasError: false }); // Vuelve a renderizar
  };

  componentDidCatch(error, info) {
    console.error('ErrorBoundary capturó un error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 mb-4 border border-red-300 dark:border-red-800 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200">
          <h3 className="font-bold text-sm">Error al mostrar este gasto</h3>
          <p className="text-xs mt-1">
            Este elemento tiene datos inválidos y no se puede mostrar.
          </p>
          <button
            onClick={this.handleRemove}
            className="mt-2 text-xs px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition"
          >
            Eliminar este gasto
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;