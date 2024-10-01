type Callback = (...args: any[]) => any;

interface Callbacks
{
	[key: string]: Callback[];
}

interface NameParts 
{
	original: string;
	value: string;
	namespace: string;
}

export default class EventEmitter 
{
	private callbacks: { [key: string]: Callbacks } = {};
	private baseNamespace = 'base';

	constructor()
	{
		this.callbacks[this.baseNamespace] = {};
	}

	on(names: string, callback: Callback): this
	{
		if (typeof names === 'undefined' || names === '') 
		{
			console.warn('wrong names');
			return this;
		}

		if (typeof callback === 'undefined') 
		{
			console.warn('wrong callback');
			return this;
		}

		const resolvedNames = this.resolveNames(names);

		resolvedNames.forEach((name) => 
		{
			const resolvedName = this.resolveName(name);

			if (!(this.callbacks[resolvedName.namespace] instanceof Object)) 
				this.callbacks[resolvedName.namespace] = {};

			if (!(this.callbacks[resolvedName.namespace][resolvedName.value] instanceof Array)) 
				this.callbacks[resolvedName.namespace][resolvedName.value] = [];

			this.callbacks[resolvedName.namespace][resolvedName.value].push(callback);
		});

		return this;
	}

	off(names: string): this 
	{
		if (typeof names === 'undefined' || names === '') 
		{
			console.warn('wrong name');
			return this;
		}

		const resolvedNames = this.resolveNames(names);

		resolvedNames.forEach((name) => 
		{
			const resolvedName = this.resolveName(name);

			if (resolvedName.namespace !== this.baseNamespace && resolvedName.value === '') 
				delete this.callbacks[resolvedName.namespace];
			else 
			{
				if (resolvedName.namespace === this.baseNamespace) 
				{
					for (const namespace in this.callbacks) 
					{
						if (this.callbacks[namespace] instanceof Object && this.callbacks[namespace][resolvedName.value] instanceof Array) 
						{
							delete this.callbacks[namespace][resolvedName.value];

							if (Object.keys(this.callbacks[namespace]).length === 0) 
								delete this.callbacks[namespace];
						}
					}
				}
				else if (this.callbacks[resolvedName.namespace] instanceof Object && this.callbacks[resolvedName.namespace][resolvedName.value] instanceof Array) 
				{
					delete this.callbacks[resolvedName.namespace][resolvedName.value];

					if (Object.keys(this.callbacks[resolvedName.namespace]).length === 0) 
						delete this.callbacks[resolvedName.namespace];
				}
			}
		});
		return this;
	}

	trigger(name: string, args: any[] = []): any
	{
		if (typeof name === 'undefined' || name === '')
		{
			console.warn('wrong name');
			return false;
		}

		let finalResult: any = null;
		let result: any = null;

		const resolvedNames = this.resolveNames(name);

		const resolvedName = this.resolveName(resolvedNames[0]);

		if (resolvedName.namespace === this.baseNamespace)
		{
			for (const namespace in this.callbacks)
			{
				if (this.callbacks[namespace] instanceof Object && this.callbacks[namespace][resolvedName.value] instanceof Array)
				{
					this.callbacks[namespace][resolvedName.value].forEach((callback) =>
					{
						result = callback.apply(this, args);

						if (typeof finalResult === 'undefined')
							finalResult = result;
					});
				}
			}
		} 
		else if (this.callbacks[resolvedName.namespace] instanceof Object)
		{
			if (resolvedName.value === '')
			{
				console.warn('wrong name');
				return this;
			}

			this.callbacks[resolvedName.namespace][resolvedName.value].forEach((callback) =>
			{
				result = callback.apply(this, args);

				if (typeof finalResult === 'undefined')
				{
					finalResult = result;
				}
			});
		}
		return finalResult;
	}

	private resolveNames(names: string): string[]
	{
		let resolvedNames: string | string[] = names;
		resolvedNames = resolvedNames.replace(/[^a-zA-Z0-9 ,/.]/g, '');
		resolvedNames = resolvedNames.replace(/[,/]+/g, ' ');
		resolvedNames = resolvedNames.split(' ');

		return resolvedNames;
	}

	private resolveName(name: string): NameParts
	{
		const newName: NameParts =
		{
			original: name,
			value: '',
			namespace: this.baseNamespace,
		};

		const parts = name.split('.');

		newName.value = parts[0];

		if (parts.length > 1 && parts[1] !== '')
			newName.namespace = parts[1];

		return newName;
	}
}
