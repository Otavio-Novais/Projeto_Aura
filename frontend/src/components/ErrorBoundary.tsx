import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-4xl mb-4">⚠️</p>
          <h2 className="text-lg font-semibold mb-2">Algo deu errado</h2>
          <p className="text-gray-400 text-sm mb-4">
            Ocorreu um erro ao carregar esta seção.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
